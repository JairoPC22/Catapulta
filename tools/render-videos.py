"""Local, free motion-design renderer. Requires Pillow and aggdraw; FFmpeg on PATH.
Original AAC is stream-copied, never synthesized or re-encoded. See content/VIDEOS.md.
Outputs and originals live outside videos/ until both exports pass validation.
"""
import argparse, functools, hashlib, json, math, os, pathlib, shutil, subprocess, sys, tempfile
sys.path.insert(0, os.path.join(tempfile.gettempdir(), 'catapulta-video-deps'))
import aggdraw
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parents[1]
WORK = pathlib.Path(tempfile.gettempdir()) / 'catapulta-motion-v2'
WORK.mkdir(exist_ok=True)
NAVY='#102D40'; TEAL='#008F83'; MINT='#23BEA9'; SKY='#4AA6CB'; INK='#193C4D'
PALE='#EAF4F8'; LINE='#CDDEE6'; WHITE='#FFFFFF'; MUTED='#536E7C'
def clamp(x): return max(0,min(1,x))
def ease(x): x=clamp(x); return x*x*(3-2*x)
def lerp(a,b,u): return a+(b-a)*u
@functools.lru_cache(maxsize=128)
def font(size,bold=False): return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),int(size))

class Art:
    def __init__(self,im,ox=0,oy=0,s=1): self.im=im; self.d=ImageDraw.Draw(im); self.ox=ox;self.oy=oy;self.s=s
    def p(self,x,y): return (self.ox+x*self.s,self.oy+y*self.s)
    def box(self,xy,fill,r=0,outline=None,width=1):
        x,y,X,Y=xy; b=(*self.p(x,y),*self.p(X,Y))
        self.d.rounded_rectangle(b,radius=r*self.s,fill=fill,outline=outline,width=max(1,int(width*self.s)))
    def ellipse(self,xy,fill,outline=None,width=1):
        x,y,X,Y=xy; self.d.ellipse((*self.p(x,y),*self.p(X,Y)),fill,outline,width=max(1,int(width*self.s)))
    def line(self,pts,fill,width=2): self.d.line([self.p(*p) for p in pts],fill=fill,width=max(1,int(width*self.s)),joint='curve')
    def path(self,commands,fill=None,stroke=None,width=1):
        ctx=aggdraw.Draw(self.im);p=aggdraw.Path()
        for c in commands:
            op,*v=c
            if op=='M':p.moveto(*self.p(*v))
            elif op=='L':p.lineto(*self.p(*v))
            elif op=='C':p.curveto(*self.p(*v[:2]),*self.p(*v[2:4]),*self.p(*v[4:]))
            elif op=='Q': pass
            else:p.close()
        ctx.path(p,aggdraw.Brush(fill) if fill else None,aggdraw.Pen(stroke,width*self.s) if stroke else None);ctx.flush()
    def txt(self,x,y,txt,size=24,fill=INK,bold=False,anchor=None):
        self.d.text(self.p(x,y),txt,font=font(round(size*self.s),bold),fill=fill,anchor=anchor)
    def limb(self,a,b,c,color,width):
        self.line([a,b,c],color,width)
        for x,y in [a,b,c]:self.ellipse((x-width/2,y-width/2,x+width/2,y+width/2),color)

def tick(a,x,y,s=1,color=WHITE,progress=1):
    pts=[(x-17*s,y),(x-3*s,y+13*s),(x+22*s,y-18*s)]
    if progress<.4: pts=[pts[0],(lerp(pts[0][0],pts[1][0],progress/.4),lerp(pts[0][1],pts[1][1],progress/.4))]
    elif progress<1:pts=[pts[0],pts[1],(lerp(pts[1][0],pts[2][0],(progress-.4)/.6),lerp(pts[1][1],pts[2][1],(progress-.4)/.6))]
    a.line(pts,color,7*s)

def card(a,x,y,s=1):
    a.box((x,y,x+91*s,y+56*s),TEAL,9*s)
    a.box((x+11*s,y+12*s,x+28*s,y+26*s),'#D8D8AD',3*s)
    a.line([(x+12*s,y+43*s),(x+45*s,y+43*s)],'#9CE2D6',3*s)
    for i in range(3): a.ellipse((x+(64+i*7)*s,y+36*s,x+(67+i*7)*s,y+39*s),WHITE)

def terminal(a,x,y,s=1,t=0,paid=False):
    a.box((x+10*s,y+15*s,x+160*s,y+253*s),'#CADDE5',24*s)
    a.box((x,y,x+150*s,y+242*s),NAVY,23*s)
    a.box((x+11*s,y+17*s,x+139*s,y+153*s),'#EAF6F8',12*s)
    a.box((x+45*s,y+7*s,x+103*s,y+12*s),'#5D7885',3*s)
    a.txt(x+75*s,y+35*s,'Catapulta',14*s,TEAL,True,'mt')
    if paid:
        a.ellipse((x+45*s,y+70*s,x+105*s,y+130*s),TEAL);tick(a,x+75*s,y+101*s,.7*s,progress=ease(t))
    else:
        a.txt(x+75*s,y+79*s,'Cobrar',22*s,NAVY,True,'mt')
        a.line([(x+35*s,y+128*s),(x+115*s,y+128*s)],'#AAC8D4',3*s)
    for row in range(3):
        for col in range(3): a.box((x+(23+col*38)*s,y+(169+row*19)*s,x+(49+col*38)*s,y+(179+row*19)*s),('#2F5668' if col<2 else TEAL),4*s)

def human(a,x,y,scale=1,t=0,role='merchant',reach=None,face='happy',phase=0,_flipped=False):
    """Articulated editorial character, local feet at y+510; reach is a local hand target."""
    if role=='customer' and not _flipped:
        tile=Image.new('RGBA',(470,550),(0,0,0,0))
        hand=human(Art(tile),100,0,1,t,role,reach,face,phase,True)
        tile=tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        tile=tile.resize((round(470*a.s*scale),round(550*a.s*scale)),Image.Resampling.LANCZOS)
        a.im.paste(tile,tuple(round(v) for v in a.p(x-130*scale,y)),tile)
        return (x+(340-hand[0])*scale,y+hand[1]*scale)
    q=Art(a.im,*a.p(x,y),a.s*scale)
    bob=math.sin(t*2.1+phase)*2
    skin='#C88F6C' if role!='customer' else '#E4B494'; shade='#AC7055' if role!='customer' else '#C28B70'
    hair='#233843';cloth=TEAL if role=='merchant' else ('#407CA4' if role=='customer' else '#326A7C')
    # Ground shadow and walking/weight shift.
    q.ellipse((35,499,226,520),'#D2E2E9')
    stride=math.sin(t*3)*9 if face=='leaving' else math.sin(t*1.3)*2
    q.path([('M',76,306),('L',169,306),('L',184+stride,479),('L',146+stride,483),('L',122,370),('L',107-stride,481),('L',67-stride,480),('Z',)],NAVY)
    q.path([('M',123,332),('L',141,397),('L',150,477)],None,'#254658',5)
    q.box((59-stride,474,111-stride,499),hair,11);q.box((142+stride,475,198+stride,500),hair,11)
    q.line([(64-stride,495),(106-stride,495)],'#70828B',3);q.line([(149+stride,495),(193+stride,495)],'#70828B',3)
    # Back arm falls naturally, front arm has elbow and hand articulation.
    q.limb((67,191+bob),(41,261+bob),(55,325+bob),cloth,34)
    q.limb((49,282+bob),(50,309+bob),(57,331+bob),skin,25)
    q.ellipse((45,320+bob,68,351+bob),skin)
    # Tailored torso, collar and apron; no stick figures.
    q.path([('M',83,166+bob),('C',102,157+bob,144,157+bob,166,171+bob),('C',186,190+bob,179,259+bob,182,320),('C',146,333,99,334,64,319),('L',66,209+bob),('C',65,184+bob,71,175+bob,83,166+bob),('Z',)],cloth)
    q.path([('M',154,178+bob),('C',171,225,160,277,178,318),('L',150,324),('C',145,268,154,220,140,177+bob),('Z',)],'#006F69' if role=='merchant' else '#2C607E')
    q.box((103,138+bob,139,176+bob),skin,12)
    q.path([('M',100,158+bob),('L',120,181+bob),('L',140,158+bob),('L',151,171+bob),('L',136,197+bob),('L',120,182+bob),('L',104,197+bob),('L',88,172+bob),('Z',)],'#F1F7F8')
    if role=='merchant':
        q.path([('M',91,185+bob),('L',99,185+bob),('L',99,221+bob),('L',150,221+bob),('L',150,185+bob),('L',158,185+bob),('L',168,320),('C',137,330,102,330,76,318),('Z',)],'#BBD8DA')
        q.box((103,254+bob,146,286+bob),'#95BDC2',5);q.line([(105,258+bob),(144,258+bob)],'#719CA5',2)
    else:
        q.line([(121,194+bob),(124,317)],'#88B5C6',2)
        for yy in [213,247,280]:q.ellipse((126,yy+bob,130,yy+4+bob),WHITE)
    # Neck shadow, ears, face, sculpted hair.
    q.ellipse((107,139+bob,137,151+bob),shade)
    q.ellipse((75,95+bob,94,121+bob),skin);q.ellipse((151,94+bob,168,119+bob),shade)
    q.path([('M',86,74+bob),('C',83,32+bob,151,28+bob,157,72+bob),('L',156,113+bob),('C',155,142+bob,137,156+bob,120,154+bob),('C',99,153+bob,86,137+bob,85,117+bob),('Z',)],skin)
    q.path([('M',141,75+bob),('C',153,96+bob,148,130+bob,135,148+bob),('C',151,141+bob,157,129+bob,157,109+bob),('L',157,72+bob),('Z',)],shade)
    q.path([('M',82,104+bob),('C',72,85+bob,73,55+bob,91,45+bob),('C',92,20+bob,145,21+bob,157,43+bob),('C',174,54+bob,166,91+bob,157,105+bob),('L',149,72+bob),('C',122,81+bob,107,75+bob,97,65+bob),('L',91,103+bob),('Z',)],hair)
    q.path([('M',92,49+bob),('C',107,36+bob,132,36+bob,145,45+bob)],None,'#49606B',4)
    blink=(t+phase)%4.3>4.13
    for xx in [103,140]:
        q.line([(xx-5,96+bob),(xx+3,95+bob)],hair,3)
        if blink:q.line([(xx-3,106+bob),(xx+3,106+bob)],hair,2)
        else:q.ellipse((xx-2,103+bob,xx+2,110+bob),hair)
    q.path([('M',122,107+bob),('L',119,122+bob),('L',127,123+bob)],None,shade,2)
    q.path([('M',109,132+bob),('C',117,138+bob,129,138+bob,137,130+bob)],None,hair,2.6)
    if role=='support':
        q.path([('M',80,103+bob),('C',68,28+bob,170,22+bob,169,100+bob)],None,NAVY,9)
        q.box((77,93+bob,91,124+bob),NAVY,6);q.box((156,92+bob,170,124+bob),NAVY,6)
        q.path([('M',165,121+bob),('C',163,140+bob,151,144+bob,136,142+bob)],None,NAVY,4);q.box((130,138+bob,143,146+bob),TEAL,3)
    # Shoulder => elbow => wrist, with separate sleeve and forearm.
    hand=reach if reach else (195+math.sin(t*2+phase)*8,278+bob)
    elbow=(197,224+bob) if reach else (204,242+bob)
    q.limb((165,193+bob),elbow,((elbow[0]+hand[0])*.5,(elbow[1]+hand[1])*.5),cloth,34)
    q.limb(elbow,((elbow[0]+hand[0])*.5,(elbow[1]+hand[1])*.5),hand,skin,24)
    q.ellipse((hand[0]-12,hand[1]-12,hand[0]+13,hand[1]+13),skin)
    q.line([(hand[0]-2,hand[1]+4),(hand[0]+8,hand[1]+5)],shade,2)
    return (x+hand[0]*scale,y+hand[1]*scale)

def shop(a,x=180,y=110,s=1):
    q=Art(a.im,*a.p(x,y),a.s*s)
    q.box((0,0,620,422),WHITE,24,LINE,2);q.box((0,0,620,78),NAVY,20)
    q.box((0,52,620,79),NAVY);q.txt(35,22,'TU NEGOCIO',23,WHITE,True)
    for k in range(8):
        q.box((k*77.5,79,(k+1)*77.5,135),TEAL if k%2==0 else '#D1EEE9',0)
        q.ellipse((k*77.5,115,(k+1)*77.5,151),TEAL if k%2==0 else '#D1EEE9')
    q.box((33,172,210,383),PALE,9,LINE,2)
    q.line([(120,173),(120,380)],LINE,3)
    q.box((236,179,588,334),PALE,12)
    for j in range(3):
        q.line([(251,226+j*45),(570,226+j*45)],'#C7DFE6',3)
        for k in range(5): q.box((260+k*60,198+j*45,288+k*60,224+j*45),['#82BFC4','#C3DED3','#91B6D1'][j],4)

def bank(a,x,y,t):
    a.box((x,y,x+280,y+226),WHITE,22,LINE,2)
    a.path([('M',x+40,y+79),('L',x+140,y+25),('L',x+240,y+79),('Z',)],NAVY)
    for k in range(3): a.box((x+65+k*62,y+94,x+87+k*62,y+173),SKY,4)
    a.box((x+42,y+181,x+237,y+192),NAVY,3);a.txt(x+140,y+204,'Bancos patrocinadores',17,MUTED,True,'mm')

def laptop(a,x,y,t,secure=False,support=False):
    a.box((x,y,x+365,y+245),NAVY,18)
    a.box((x+14,y+15,x+351,y+228),WHITE,9)
    a.box((x+14,y+15,x+351,y+47),PALE,9)
    for k in range(3):a.ellipse((x+29+k*13,y+27,x+35+k*13,y+33),'#91AFBC')
    a.txt(x+35,y+65,'Estamos contigo' if support else 'Pago en línea',23,NAVY,True)
    if support:
        a.box((x+33,y+112,x+266,y+148),PALE,10)
        a.box((x+94,y+160,x+323,y+197),'#D7EEE9',10)
        for k in range(3):
            dy=math.sin(t*4+k)*3
            a.ellipse((x+120+k*16,y+174+dy,x+126+k*16,y+180+dy),TEAL)
    else:
        for yy in [112,153]:a.box((x+33,y+yy,x+323,y+yy+27),PALE,5)
        a.box((x+33,y+193,x+323,y+216),TEAL,5)
    a.path([('M',x-27,y+247),('L',x+392,y+247),('L',x+370,y+272),('L',x-10,y+272),('Z',)],'#92B4C3')
    if secure:shield(a,x+181,y+140,0.6,t)

def shield(a,x,y,s,t):
    a.path([('M',x,y-85*s),('L',x+70*s,y-58*s),('L',x+62*s,y+21*s),('C',x+54*s,y+58*s,x+26*s,y+81*s,x,y+96*s),('C',x-26*s,y+81*s,x-54*s,y+58*s,x-62*s,y+21*s),('L',x-70*s,y-58*s),('Z',)],TEAL)
    tick(a,x,y,1.25*s,progress=ease(t))

def bubble(a,x,y,label,t,w=210):
    a.box((x+4,y+5,x+w+4,y+71),'#D8E6EC',18)
    a.box((x,y,x+w,y+66),WHITE,18,LINE,1)
    a.txt(x+w/2,y+32,label,24,TEAL,True,'mm')

def scene(a,kind,u,t):
    # Shared stage has intentional white space and a consistent ground plane.
    a.ellipse((43,62,941,740),'#E0EFF3')
    a.line([(48,691),(948,691)],'#BBD3DE',2)
    if kind in ('welcome','sale','question','loss','choice','risk'):
        shop(a,150,86,.98)
        customerx=558+(ease((u-.35)/2)*200 if kind=='loss' else 0)
        reach=(175+ease(u/.7)*86,239-math.sin(clamp(u/1.4)*math.pi)*24)
        human(a,215,186,.96,t,'merchant',reach=(239,230+math.sin(t*2)*7))
        hx,hy=human(a,customerx,206,.92,t,'customer',reach=reach,face='leaving' if kind=='loss' else 'happy',phase=1.1)
        # Foreground counter anchors both people to the scene.
        a.box((148,502,849,541),'#B1D4D9',13);a.box((171,539,824,691),WHITE,8,LINE,2)
        a.box((195,559,800,667),PALE,7)
        if kind!='question' and kind!='loss':terminal(a,459,350,.64,u-.65,kind=='sale' and u>.65)
        if kind in ('sale','welcome','choice'):card(a,hx-71,hy-18,.68)
        if kind=='question':
            card(a,hx-62,hy-26,.75);bubble(a,464,215,'¿Con tarjeta?',u,230)
        elif kind=='loss': bubble(a,430,215,'Una venta perdida',u,260)
        elif kind=='welcome':bubble(a,368,155,'Estamos contigo',u,245)
        elif kind=='choice':bubble(a,417,167,'Tu equipo ideal',u,230)
        elif kind=='risk':bubble(a,428,208,'Evaluamos tu negocio',u,291)
        elif kind=='sale' and u>.65:
            for k in range(3):
                rr=19+k*12+math.sin(t*3)*2
                a.d.arc((*a.p(540-rr,367-rr),*a.p(540+rr,367+rr)),230,310,fill=TEAL,width=max(2,int(a.s*3)))
    elif kind=='banks':
        human(a,92,179,.98,t,'merchant',reach=(254,222))
        bank(a,586,138,t);shop(a,439,463,.65)
        a.line([(387,389),(515,389),(515,250),(580,250)],'#9BBFCA',4)
        a.line([(515,389),(515,440),(637,440),(637,461)],'#9BBFCA',4)
        for k in range(3):
            p=((t*.3+k/3)%1);a.ellipse((lerp(390,581,p)-7,382,lerp(390,581,p)+7,396),TEAL)
        bubble(a,431,49,'Conexiones que impulsan',u,347)
    elif kind in ('gateway','security'):
        human(a,100,173,.99,t,'merchant',reach=(259,248))
        a.box((383,537,922,564),'#ABCBD5',10)
        laptop(a,459,265,t,kind=='security')
        if kind=='security':shield(a,713,165,.85,u)
        else:
            card(a,567+30*math.sin(t*1.2),167,.93)
            for k in range(3):a.ellipse((672,230+k*14,678,236+k*14),TEAL)
        bubble(a,460,606,'Transacciones protegidas' if kind=='security' else 'Cobra donde esté tu cliente',u,360)
    elif kind in ('support','contact'):
        human(a,340,129,1.04,t,'support',reach=(225,211+math.sin(t*3)*7))
        a.box((141,560,901,591),'#A8CBD5',12)
        laptop(a,385,360,t,support=True)
        bubble(a,61,198,'ES / EN',u,188)
        bubble(a,701,250,'24 / 7',u,196)
        a.line([(248,230),(294,230),(294,335)],'#9DBFCD',3)
        a.line([(700,283),(669,283),(669,332)],'#9DBFCD',3)
        if kind=='contact':
            a.box((118,623,885,703),NAVY,18);a.txt(502,661,'catapultapay.com',38,WHITE,True,'mm')
        else:
            for k in range(17):
                height=9+abs(math.sin(t*4+k*.8))*25
                a.box((312+k*21,646-height,319+k*21,646+height),TEAL,3)
    elif kind=='growth':
        for k in range(3):shop(a,38+k*318,92+(k%2)*45,.46)
        for k,role in enumerate(['customer','merchant','support']):human(a,145+k*239,252,.86,t,role,reach=(216,223+math.sin(t*2+k)*16),phase=k)
        a.box((307,39,700,142),NAVY,22);a.txt(501,89,'100+',65,WHITE,True,'mm')
    elif kind=='experience':
        shop(a,359,233,.88)
        human(a,115,166,1.03,t,'merchant',reach=(245,219))
        bubble(a,458,100,'6+ años de experiencia',u,338)
        for k in range(5):
            h=(k+1)*42*ease(u/.8)
            a.box((486+k*66,642-h,530+k*66,642),TEAL if k<4 else SKY,6)

# Caption chunks follow the unmodified voice; no automatic model text is published.
H=[
 (0,'welcome','PAGOS PARA TU NEGOCIO','Tu negocio.\nNuestro compromiso.','Conoce CatapultaPayment.'),
 (2.4,'welcome','CERCA DE TI','Siéntete en\nbuenas manos.','En CatapultaPay, queremos que te sientas cómodo con nosotros.'),
 (6.42,'experience','EXPERIENCIA','Más de 6 años\nconectando negocios.','Somos una empresa con más de seis años conectando negocios'),
 (9.74,'banks','CONEXIONES','Bancos\npatrocinadores.','con bancos patrocinadores,'),
 (11.3,'sale','SOLUCIONES DE COBRO','Terminales\nfísicos.','terminales físicos'),
 (12.38,'gateway','SOLUCIONES DE COBRO','Pasarelas\nvirtuales.','y pasarelas virtuales,'),
 (13.92,'risk','ATENCIÓN PERSONALIZADA','Cada negocio\nes diferente.','incluso si eres de alto riesgo.'),
 (16.02,'welcome','ACOMPAÑAMIENTO','Contigo en\ncada paso.','Nuestro objetivo es acompañarte.'),
 (18.2,'choice','EL EQUIPO CORRECTO','Encuentra tu\nmejor opción.','Ayudarte a elegir el equipo correcto,'),
 (20.34,'security','TECNOLOGÍA','Procesa tus pagos\nde forma segura.','procesar tus pagos de forma segura'),
 (22.4,'support','PERSONAS QUE TE APOYAN','Soporte bilingüe.\nReal. 24/7.','y crecer con soporte bilingüe real, 24/7.'),
 (26.18,'contact','HABLEMOS DE TU NEGOCIO','¿Quieres saber\nmás?','¿Te gustaría más información al respecto?'),
 (28.32,'contact','ESTAMOS PARA AYUDARTE','Escríbenos.\nCon gusto te ayudamos.','Escríbenos y con gusto te ayudamos.'),
 (30.7,'contact','CATAPULTAPAYMENT','El siguiente paso\nempieza contigo.','catapultapay.com')]
V=[
 (0,'welcome','CATAPULTAPAYMENT','Tu negocio,\nconectado.','Soluciones de pago para tu negocio.'),
 (2.54,'question','CADA VENTA CUENTA','¿Aún no cobras\ncon tarjeta?','¿Aún no cobras con tarjeta en tu negocio?'),
 (5.12,'loss','NO PIERDAS OPORTUNIDADES','Que tus clientes\npuedan pagar.','Cada venta que no puedes cobrar es un cliente que se va.'),
 (8.64,'banks','CONEXIONES PARA CRECER','Conecta tu negocio\ncon más opciones.','CatapultaPay te conecta con bancos patrocinadores,'),
 (11.28,'sale','EN TU NEGOCIO','Terminales\nfísicos.','terminales físicos'),
 (12.32,'gateway','DONDE ESTÉ TU CLIENTE','Pasarelas\nvirtuales.','y pasarelas virtuales,'),
 (13.62,'sale','EMPIEZA A COBRAR','Sin\ncomplicaciones.','para que empieces a cobrar sin complicaciones.'),
 (16.16,'support','ACOMPAÑAMIENTO REAL','Soporte bilingüe\n24/7.','Con soporte bilingüe 24/7'),
 (18.1,'security','TECNOLOGÍA QUE TE CUIDA','Protege cada\ntransacción.','y tecnología para proteger cada transacción.'),
 (20.64,'growth','NEGOCIOS COMO EL TUYO','Más de 100\nnegocios.','Más de 100 negocios ya cobran con nosotros.'),
 (23.5,'contact','CATAPULTAPAYMENT','Hablemos de\ntu negocio.','catapultapay.com')]

@functools.lru_cache(maxsize=2)
def brand(width):
    im=Image.open(ROOT/'assets/icons/logo-site.png').convert('RGBA');im.thumbnail((width,160));return im

def wrapped(d,txt,f,maxwidth):
    result=[]
    for line in txt.split('\n'):
        out=''
        for word in line.split():
            nxt=(out+' '+word).strip()
            if d.textlength(nxt,font=f)>maxwidth and out:result.append(out);out=word
            else:out=nxt
        result.append(out)
    return result

def frame(vertical,t,duration):
    w,h=(1080,1920) if vertical else (1920,1080)
    im=Image.new('RGB',(w,h),PALE);a=Art(im);d=a.d
    # Fine ruled structure instead of generic glowing gradients.
    for x in range(0,w,80):a.line([(x,0),(x,h)],'#E2EEF3',1)
    a.box((0,0,w,12),TEAL)
    pad=76 if vertical else 92
    logo=brand(284 if vertical else 310);im.paste(logo,(pad,62),logo)
    a.txt(w-pad,94,'CATAPULTA / PAYMENT',18,MUTED,True,'rm') if not vertical else None
    cues=V if vertical else H
    idx=max(i for i,c in enumerate(cues) if t>=c[0]);start,kind,kicker,title,caption=cues[idx];u=t-start
    entrance=ease(u/.45)
    # Text enters as one composition; no blurred, unreadable titles.
    tx=pad;ty=(300 if vertical else 296)+22*(1-entrance)
    a.txt(tx,ty-62,kicker,20 if not vertical else 23,TEAL,True)
    lines=wrapped(d,title,font(76 if vertical else 78,True),w-2*pad if vertical else 760)
    for j,line in enumerate(lines):a.txt(tx,ty+j*(96 if vertical else 101),line,76 if vertical else 78,NAVY,True)
    a.box((tx,ty+len(lines)*(96 if vertical else 101)+26,tx+79,ty+len(lines)*(96 if vertical else 101)+31),TEAL,2)
    if not vertical:
        a.txt(pad,684,'Un equipo contigo. Una solución para tu negocio.',24,MUTED)
        a.txt(pad,746,'catapultapay.com',29,TEAL,True)
    # Each sequence has original character motion, articulated gestures and object interaction.
    sx,sy,scale=(35,660,1.01) if vertical else (908,160,.97)
    scene(Art(im,sx,sy,scale),kind,u,t)
    # Native mobile safe-area caption panel.
    cy=1538 if vertical else 925;cw=w-2*pad
    a.box((pad,cy,pad+cw,cy+(181 if vertical else 91)),WHITE,20,LINE,1)
    caplines=wrapped(d,caption,font(33 if vertical else 29),cw-72)
    if len(caplines)>3:raise ValueError('Caption exceeds safe area: '+caption)
    lh=46 if vertical else 38
    ctop=cy+((181 if vertical else 91)-len(caplines)*lh)/2
    for j,line in enumerate(caplines):a.txt(pad+34,ctop+j*lh,line,33 if vertical else 29,INK)
    a.txt(pad,h-83 if vertical else h-43,f'{idx+1:02d} / {len(cues):02d}',18,MUTED,True)
    a.txt(w-pad,h-83 if vertical else h-43,'CATAPULTAPAYMENT',18,MUTED,True,'rt')
    a.box((pad,h-39 if vertical else h-17,w-pad,h-35 if vertical else h-13),LINE,2)
    a.box((pad,h-39 if vertical else h-17,pad+(w-2*pad)*clamp(t/duration),h-35 if vertical else h-13),TEAL,2)
    # Brief clean fade between different scenes, preserving the persistent branding/caption.
    if idx and u<.19:
        overlay=Image.new('RGB',im.size,PALE);im=Image.blend(overlay,im,.55+.45*ease(u/.19))
    return im

def audio_hash(p):
    return subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-'],text=True).strip()

def render(name,vertical,preview=False):
    src=ROOT/'videos'/f'{name}.mp4';backup=WORK/'originals'/src.name
    backup.parent.mkdir(exist_ok=True)
    if not backup.exists():shutil.copy2(src,backup)
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(backup)]))
    vs=next(s for s in info['streams'] if s['codec_type']=='video');n=int(vs['nb_frames']);duration=n/30
    if preview:
        times=[c[0]+min(.9,((V if vertical else H)[i+1][0]-c[0])*.6) if i+1<len(V if vertical else H) else c[0]+.6 for i,c in enumerate(V if vertical else H)]
        thumbw=270 if vertical else 480;thumbh=480 if vertical else 270
        cols=3;sheet=Image.new('RGB',(cols*thumbw,math.ceil(len(times)/cols)*(thumbh+35)),WHITE)
        for i,t in enumerate(times):
            f=frame(vertical,t,duration);f.save(WORK/f'{name}-{i:02d}.jpg',quality=92);f.thumbnail((thumbw,thumbh));sheet.paste(f,((i%cols)*thumbw,(i//cols)*(thumbh+35)))
            ImageDraw.Draw(sheet).text(((i%cols)*thumbw+10,(i//cols)*(thumbh+35)+thumbh+5),f'{t:.2f}s',font=font(17),fill=INK)
        sheet.save(WORK/f'{name}-storyboard.jpg',quality=92);print(WORK/f'{name}-storyboard.jpg',flush=True);return
    out=WORK/src.name;w,h=(1080,1920) if vertical else (1920,1080)
    cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r','30','-i','pipe:0','-i',str(backup),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','copy','-frames:v',str(n),'-movflags','+faststart',str(out)]
    p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    try:
        for i in range(n):
            p.stdin.write(frame(vertical,i/30,duration).tobytes())
            if i%150==0:print(name,f'{i}/{n}',flush=True)
    finally:p.stdin.close()
    if p.wait()!=0:raise RuntimeError('FFmpeg export failed')
    original_hash=audio_hash(backup);result_hash=audio_hash(out)
    if original_hash!=result_hash:raise RuntimeError('Original audio changed')
    check=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(out)]))
    v=next(s for s in check['streams'] if s['codec_type']=='video')
    if int(v['nb_frames'])!=n or (v['width'],v['height'])!=(w,h):raise RuntimeError('Export dimensions or duration changed')
    report={'file':src.name,'frames':n,'fps':30,'width':w,'height':h,'original_audio_sha256':original_hash,'export_audio_sha256':result_hash,'original_backup':str(backup),'export':str(out)}
    (WORK/(name+'-verification.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
    print('VERIFIED',out,flush=True)

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');ap.add_argument('--format',choices=['all','horizontal','vertical'],default='all');args=ap.parse_args()
    if args.format!='vertical':render('catapultapay-sitio-16x9',False,args.preview)
    if args.format!='horizontal':render('catapultapay-redes-9x16',True,args.preview)
