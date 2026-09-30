const pptxgen = require('pptxgenjs');
const p = new pptxgen(); p.layout='LAYOUT_WIDE'; // 13.33 x 7.5
const D='26282E', Y='F2C200', W='FFFFFF', G='5B8C51', L='F3F4F6', M='6B7280', T='1F2937';
const H='Cambria', B='Calibri';
const fmt=n=>Math.round(n).toLocaleString('ru-RU').replace(/ /g,' ');
const title=(s,t,n)=>{s.background={color:W};
 s.addText(t,{x:0.6,y:0.35,w:11.2,h:0.8,fontFace:H,fontSize:34,bold:true,color:T,margin:0,isTextBox:true});
 s.addShape(p.shapes.OVAL,{x:12.2,y:0.4,w:0.65,h:0.65,fill:{color:Y}});
 s.addText(String(n),{x:12.2,y:0.4,w:0.65,h:0.65,align:'center',valign:'middle',fontFace:B,fontSize:16,bold:true,color:D,margin:0,isTextBox:true});};
// parking drawing helper
function lot(s,x,y,w,h,spots,green,label){
 s.addShape(p.shapes.RECTANGLE,{x,y,w,h,fill:{color:'3A3D44'}});
 const sw=w/spots; for(let i=0;i<=spots;i++) s.addShape(p.shapes.LINE,{x:x+i*sw,y,w:0,h:h*0.45,line:{color:W,width:1.5}});
 for(let i=0;i<=spots;i++) s.addShape(p.shapes.LINE,{x:x+i*sw,y:y+h*0.55,w:0,h:h*0.45,line:{color:W,width:1.5}});
 if(green){s.addShape(p.shapes.RECTANGLE,{x:x+green[0]*w,y,w:green[1]*w,h,fill:{color:G}});
  for(let k=0;k<4;k++) s.addShape(p.shapes.OVAL,{x:x+green[0]*w+0.15+k*(green[1]*w-0.4)/3.2,y:y+h*0.3,w:0.35,h:0.35,fill:{color:'3F6B38'}});}
 if(label) s.addText(label,{x,y:y+h+0.08,w,h:0.35,fontFace:B,fontSize:12,color:M,align:'center',margin:0,isTextBox:true});}

// 1 Title
let s=p.addSlide(); s.background={color:D};
lot(s,7.3,0.9,5.4,2.4,10,null,null);
for(let i=0;i<10;i+=2) s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:7.3+i*0.54+0.1,y:0.98,w:0.34,h:0.85,fill:{color:[Y,'9CA3AF','D1D5DB',Y,'9CA3AF'][i/2]},rectRadius:0.06});
s.addShape(p.shapes.RECTANGLE,{x:7.3,y:3.7,w:0.15,h:1.2,fill:{color:'9CA3AF'}});
s.addShape(p.shapes.RECTANGLE,{x:7.3,y:3.75,w:3.2,h:0.14,fill:{color:Y}});
s.addText('Благоустройство общего имущества МКД',{x:0.7,y:1.0,w:6.3,h:0.5,fontFace:B,fontSize:16,color:Y,margin:0,isTextBox:true});
s.addText('Увеличение количества парковочных мест на придомовой территории',{x:0.7,y:1.6,w:6.3,h:2.4,fontFace:H,fontSize:34,bold:true,color:W,margin:0,valign:'top',isTextBox:true});
s.addText('МКД по адресу: ул. Нахимова, д. 20',{x:0.7,y:4.2,w:6.3,h:0.5,fontFace:B,fontSize:20,color:'E5E7EB',margin:0,isTextBox:true});
s.addText([{text:'Выполнил(а): ______________________',options:{breakLine:true}},{text:'Руководитель: ____________________',options:{breakLine:true}},{text:'2026 г.'}],{x:0.7,y:5.4,w:6,h:1.3,fontFace:B,fontSize:14,color:'9CA3AF',margin:0,isTextBox:true});

// 2 Contents
s=p.addSlide(); title(s,'Содержание',2);
const toc=['Описание объекта','Актуальность и понятие благоустройства','Цель и задачи проекта','Что нужно и что получится','Техника и материалы','Расчёт заработной платы','Смета проекта','Сроки выполнения работ','Выполнение задач и итог'];
toc.forEach((t,i)=>{const c=i<5?0:1,r=c?i-5:i,x=0.6+c*6.3,y=1.55+r*1.05;
 s.addShape(p.shapes.ROUNDED_RECTANGLE,{x,y,w:5.9,h:0.8,fill:{color:L},rectRadius:0.1});
 s.addShape(p.shapes.OVAL,{x:x+0.15,y:y+0.12,w:0.56,h:0.56,fill:{color:D}});
 s.addText(String(i+1),{x:x+0.15,y:y+0.12,w:0.56,h:0.56,align:'center',valign:'middle',fontSize:16,bold:true,color:Y,fontFace:B,margin:0,isTextBox:true});
 s.addText(t,{x:x+0.9,y,w:4.9,h:0.8,valign:'middle',fontSize:17,color:T,fontFace:B,margin:0,isTextBox:true});});

// 3 Object
s=p.addSlide(); title(s,'Описание объекта',3);
const rows=[['Адрес','ул. Нахимова, д. 20'],['Тип здания','Многоквартирный жилой дом, 9 этажей, 4 подъезда'],['Квартир','144 (≈ 330 жителей)'],['Площадь двора','≈ 2 600 м²'],['Существующая парковка','18 мест, асфальт, износ ≈ 60 %'],['Газон у парковки','≈ 450 м², 6 деревьев, кустарник'],['Въезд','Шлагбаум 2011 г., привод неисправен']];
s.addTable(rows.map(r=>[{text:r[0],options:{bold:true,color:T,fill:{color:L}}},{text:r[1],options:{color:T}}]),{x:0.6,y:1.5,w:6.6,colW:[2.5,4.1],fontFace:B,fontSize:14,rowH:0.62,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
s.addText('Схема двора (сейчас)',{x:7.7,y:1.5,w:5,h:0.4,fontFace:B,fontSize:14,bold:true,color:M,margin:0,isTextBox:true});
s.addShape(p.shapes.RECTANGLE,{x:7.7,y:2.0,w:5,h:1.0,fill:{color:'B8BEC8'}});
s.addText('ЖИЛОЙ ДОМ  ·  Нахимова, 20',{x:7.7,y:2.0,w:5,h:1.0,align:'center',valign:'middle',fontSize:14,bold:true,color:T,fontFace:B,margin:0,isTextBox:true});
lot(s,7.7,3.5,5,1.6,18,[0.52,0.48],'Слева: 18 мест · справа: газон 450 м²');
s.addShape(p.shapes.RECTANGLE,{x:7.7,y:5.9,w:2.6,h:0.12,fill:{color:Y}});
s.addText('шлагбаум (въезд)',{x:10.45,y:5.75,w:2.3,h:0.4,fontSize:12,color:M,fontFace:B,margin:0,isTextBox:true});

// 4 Maps
s=p.addSlide(); title(s,'Объект на Яндекс Картах',4);
s.addImage({path:__dirname+'/img/sat.jpg',x:0.6,y:1.5,w:5.2,h:3.6});
s.addImage({path:__dirname+'/img/pano.jpg',x:6.1,y:1.5,w:6.4,h:3.61});
s.addText('Спутниковый снимок',{x:0.6,y:5.2,w:5.2,h:0.4,fontFace:B,fontSize:14,bold:true,color:T,margin:0,isTextBox:true});
s.addText('Панорама с ул. Нахимова',{x:6.1,y:5.2,w:6.4,h:0.4,fontFace:B,fontSize:14,bold:true,color:T,margin:0,isTextBox:true});
s.addText('Источник: Яндекс Карты (yandex.ru/maps), Санкт-Петербург, ул. Нахимова, д. 20',{x:0.6,y:6.5,w:12.1,h:0.4,fontFace:B,fontSize:12,color:M,margin:0,isTextBox:true});

// 4 Relevance
s=p.addSlide(); title(s,'Актуальность и понятие благоустройства',5);
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:0.6,y:1.5,w:6.2,h:2.3,fill:{color:D},rectRadius:0.12});
s.addText([{text:'Благоустройство',options:{bold:true,color:Y,breakLine:true}},{text:'— комплекс мероприятий по содержанию и развитию территории, направленных на повышение комфорта и безопасности жителей (п. 36 ст. 1 ГрК РФ). Придомовая территория входит в состав общего имущества МКД (ст. 36 ЖК РФ), решение о её изменении принимает общее собрание собственников (ст. 44 ЖК РФ).',options:{color:W}}],{x:0.9,y:1.6,w:5.7,h:2.1,fontFace:B,fontSize:14,valign:'middle',margin:0,isTextBox:true});
[['144','квартиры'],['≈ 95','автомобилей у жителей'],['18','парковочных мест сейчас']].forEach((k,i)=>{const x=0.6+i*2.1;
 s.addText(k[0],{x,y:4.2,w:2,h:0.9,fontFace:H,fontSize:44,bold:true,color:T,margin:0,isTextBox:true});
 s.addText(k[1],{x,y:5.1,w:1.9,h:0.6,fontFace:B,fontSize:13,color:M,margin:0,valign:'top',isTextBox:true});});
s.addText('Проблемы сегодня',{x:7.3,y:1.5,w:5.4,h:0.5,fontFace:B,fontSize:20,bold:true,color:T,margin:0,isTextBox:true});
s.addText(['Дефицит мест: ≈ 5 машин на 1 место','Парковка на газоне и тротуарах — вытоптанная трава, грязь','Блокируется проезд пожарной и скорой помощи','Неисправный шлагбаум — во двор заезжают посторонние','Нет освещения и водоотвода, лужи после дождя'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:7.3,y:2.1,w:5.4,h:3.6,fontFace:B,fontSize:15,color:T,paraSpaceAfter:10,margin:0,valign:'top',isTextBox:true});

// 5 Goal & tasks
s=p.addSlide(); title(s,'Цель и задачи проекта',6);
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:0.6,y:1.4,w:12.1,h:1.2,fill:{color:Y},rectRadius:0.12});
s.addText([{text:'ЦЕЛЬ:  ',options:{bold:true}},{text:'увеличить количество парковочных мест на придомовой территории МКД ул. Нахимова, 20 с 18 до 38.'}],{x:0.9,y:1.4,w:11.6,h:1.2,valign:'middle',fontFace:B,fontSize:20,color:D,margin:0,isTextBox:true});
const tasks=['Обследовать территорию и получить решение общего собрания собственников','Демонтировать озеленение (газон 450 м², 6 деревьев) и старый бордюр','Устроить основание и асфальтовое покрытие на 20 новых мест','Заменить шлагбаум, сделать освещение и водоотвод','Рассчитать смету, зарплату, технику и график работ'];
tasks.forEach((t,i)=>{const x=0.6+i*2.46;
 s.addShape(p.shapes.ROUNDED_RECTANGLE,{x,y:3.0,w:2.25,h:3.6,fill:{color:L},rectRadius:0.1});
 s.addShape(p.shapes.OVAL,{x:x+0.2,y:3.2,w:0.7,h:0.7,fill:{color:D}});
 s.addText(String(i+1),{x:x+0.2,y:3.2,w:0.7,h:0.7,align:'center',valign:'middle',fontSize:20,bold:true,color:Y,fontFace:B,margin:0,isTextBox:true});
 s.addText('Задача '+(i+1),{x:x+0.2,y:4.05,w:1.9,h:0.4,fontSize:13,bold:true,color:M,fontFace:B,margin:0,isTextBox:true});
 s.addText(t,{x:x+0.2,y:4.45,w:1.9,h:2.0,fontSize:14,color:T,fontFace:B,margin:0,valign:'top',isTextBox:true});});

// 6 Before / after
s=p.addSlide(); title(s,'Что нужно и что получится',7);
s.addText('БЫЛО',{x:0.6,y:1.4,w:5.8,h:0.5,fontFace:B,fontSize:18,bold:true,color:M,margin:0,isTextBox:true});
lot(s,0.6,2.0,5.8,1.7,18,[0.52,0.48],'18 мест + газон 450 м²');
s.addText('СТАНЕТ',{x:6.9,y:1.4,w:5.8,h:0.5,fontFace:B,fontSize:18,bold:true,color:G,margin:0,isTextBox:true});
lot(s,6.9,2.0,5.8,1.7,38,null,'38 мест (в т.ч. 2 места для инвалидов)');
s.addShape(p.shapes.RECTANGLE,{x:6.9+5.8-0.31,y:2.0,w:0.31,h:1.7,fill:{color:'2563EB'}});
s.addText('Что нужно',{x:0.6,y:4.35,w:5.8,h:0.4,fontFace:B,fontSize:16,bold:true,color:T,margin:0,isTextBox:true});
s.addText(['Решение ОСС (≥ 2/3 голосов) и проект','Порубочный билет и компенсационное озеленение','Подрядчик, техника, материалы — ≈ 3,1 млн ₽','6 недель работ (июнь — июль)'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:0.6,y:4.8,w:5.8,h:2.1,fontFace:B,fontSize:14,color:T,paraSpaceAfter:6,margin:0,valign:'top',isTextBox:true});
s.addText('Что получится',{x:6.9,y:4.35,w:5.8,h:0.4,fontFace:B,fontSize:16,bold:true,color:T,margin:0,isTextBox:true});
s.addText(['+20 мест (рост на 111 %)','Новый автоматический шлагбаум с GSM-управлением','Освещение, водоотвод, разметка','Свободные проезды для спецтехники'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:6.9,y:4.8,w:5.8,h:2.1,fontFace:B,fontSize:14,color:T,paraSpaceAfter:6,margin:0,valign:'top',isTextBox:true});

// data
const tech=[['Экскаватор-погрузчик JCB 3CX (с машинистом)','маш.-ч',24,3200],['Самосвал КАМАЗ 65115, 15 т (вывоз грунта)','рейс',14,6500],['Автовышка 18 м (обрезка/спил деревьев)','маш.-ч',8,2500],['Каток дорожный 6 т','маш.-ч',16,2800],['Асфальтоукладчик','маш.-ч',8,6500],['Виброплита, бензопилы, инструмент','сут',10,1500]];
const staff=[['Прораб','1',25,4500],['Дорожные рабочие','4',20,3500],['Разнорабочие','2',10,2800],['Арборист (спил деревьев)','1',2,6000],['Электромонтажник','1',5,4000]];
const ts=tech.map(r=>r[2]*r[3]), techSum=ts.reduce((a,b)=>a+b);
const ss=staff.map(r=>r[1]*r[2]*r[3]), fot=ss.reduce((a,b)=>a+b), ins=fot*0.3, zp=fot+ins;
const mat=[['Демонтаж озеленения, корчевание 6 пней, срезка грунта 90 м³',48000+27000+58500],['Демонтаж бордюра и шлагбаума',30000+15000],['Геотекстиль 450 м², песок 90 м³, щебень 113 м³',40500+126000+292500],['Асфальтобетон в 2 слоя, 450 м²',562500],['Бордюр БР 100.30.15 с установкой, 140 м',182000],['Водоотвод: лотки 30 м + дождеприёмник',105000],['Шлагбаум автомат. с GSM-модулем + монтаж',185000+60000],['Освещение: 2 опоры LED с кабелем',110000],['Разметка (термопластик) + 2 знака',39600+12000],['Компенсационное озеленение (15 кустов, кашпо)',40000],['Проект и согласования',70000]];
const matSum=mat.reduce((a,r)=>a+r[1],0);
const sub=matSum+techSum+zp, res=sub*0.05, total=sub+res;
console.log({techSum,fot,zp,matSum,total});

// 7 Tech
s=p.addSlide(); title(s,'Техника и механизмы',8);
s.addTable([[ 'Техника','Ед.','Кол-во','Цена, ₽','Сумма, ₽'].map(t=>({text:t,options:{bold:true,color:W,fill:{color:D}}}))].concat(tech.map((r,i)=>[r[0],r[1],String(r[2]),fmt(r[3]),fmt(ts[i])])).concat([[{text:'Итого техника',options:{bold:true,colspan:4}},{text:fmt(techSum),options:{bold:true}}]]),{x:0.6,y:1.5,w:8.4,colW:[4.2,0.9,1.0,1.1,1.2],fontFace:B,fontSize:13,color:T,rowH:0.55,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:9.4,y:1.5,w:3.3,h:2.4,fill:{color:D},rectRadius:0.12});
s.addText(fmt(techSum)+' ₽',{x:9.6,y:1.7,w:2.9,h:1,fontFace:H,fontSize:30,bold:true,color:Y,margin:0,isTextBox:true});
s.addText('аренда техники с операторами',{x:9.6,y:2.7,w:2.9,h:0.9,fontFace:B,fontSize:14,color:W,margin:0,valign:'top',isTextBox:true});
s.addText('Цены — средние ставки аренды спецтехники в регионе, 2026 г. Топливо и работа машинистов включены.',{x:9.4,y:4.2,w:3.3,h:1.5,fontFace:B,fontSize:12,color:M,margin:0,valign:'top',isTextBox:true});

// 8 Salary
s=p.addSlide(); title(s,'Расчёт заработной платы',9);
s.addTable([['Должность','Чел.','Дней','Ставка ₽/день','ФОТ, ₽'].map(t=>({text:t,options:{bold:true,color:W,fill:{color:D}}}))].concat(staff.map((r,i)=>[r[0],r[1],String(r[2]),fmt(r[3]),fmt(ss[i])])).concat([[{text:'Фонд оплаты труда',options:{bold:true,colspan:4}},{text:fmt(fot),options:{bold:true}}],[{text:'Страховые взносы 30 %',options:{colspan:4}},fmt(ins)],[{text:'Итого зарплата с взносами',options:{bold:true,colspan:4,fill:{color:Y}}},{text:fmt(zp),options:{bold:true,fill:{color:Y}}}]]),{x:0.6,y:1.5,w:8.4,colW:[3.6,0.8,0.9,1.6,1.5],fontFace:B,fontSize:13,color:T,rowH:0.52,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
s.addText('Формула',{x:9.4,y:1.5,w:3.3,h:0.4,fontFace:B,fontSize:16,bold:true,color:T,margin:0,isTextBox:true});
s.addText('ФОТ = численность × дни × дневная ставка\n\nВзносы = ФОТ × 30 %\n\nБригада: 9 человек, пик — 7 человек на объекте одновременно.',{x:9.4,y:2.0,w:3.3,h:3.5,fontFace:B,fontSize:14,color:T,margin:0,valign:'top',isTextBox:true});

// 9 Smeta
s=p.addSlide(); title(s,'Смета проекта',10);
const body=mat.map(r=>[r[0],fmt(r[1])]);
s.addTable([[{text:'Материалы и работы',options:{bold:true,color:W,fill:{color:D}}},{text:'Сумма, ₽',options:{bold:true,color:W,fill:{color:D}}}]].concat(body),{x:0.6,y:1.4,w:7.4,colW:[5.8,1.6],fontFace:B,fontSize:12,color:T,rowH:0.41,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
const sum=[['Материалы и работы',matSum],['Техника',techSum],['Зарплата с взносами',zp],['Непредвиденные 5 %',res]];
sum.forEach((r,i)=>{s.addText(r[0],{x:8.5,y:1.45+i*0.6,w:2.5,h:0.5,fontFace:B,fontSize:14,color:T,margin:0,valign:'middle',isTextBox:true});
 s.addText(fmt(r[1])+' ₽',{x:10.9,y:1.45+i*0.6,w:1.8,h:0.5,fontFace:B,fontSize:14,bold:true,color:T,align:'right',margin:0,valign:'middle',isTextBox:true});});
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:8.5,y:4.05,w:4.2,h:1.5,fill:{color:D},rectRadius:0.12});
s.addText('ИТОГО ПО СМЕТЕ',{x:8.75,y:4.15,w:3.8,h:0.4,fontFace:B,fontSize:13,bold:true,color:W,margin:0,isTextBox:true});
s.addText(fmt(total)+' ₽',{x:8.75,y:4.55,w:3.8,h:0.8,fontFace:H,fontSize:30,bold:true,color:Y,margin:0,isTextBox:true});
s.addText([{text:'≈ '+fmt(total/144)+' ₽',options:{bold:true}},{text:' с квартиры (144 кв.) или '},{text:'≈ '+fmt(total/20)+' ₽',options:{bold:true}},{text:' за одно новое место. Источник — фонд текущего ремонта / целевой сбор по решению ОСС.'}],{x:8.5,y:5.75,w:4.2,h:1.2,fontFace:B,fontSize:12,color:T,margin:0,valign:'top',isTextBox:true});

// 10 Gantt
s=p.addSlide(); title(s,'Сроки выполнения работ',11);
const st=[['ОСС, проект, согласования, порубочный билет',0,4],['Спил деревьев, корчевание, демонтаж',4,1],['Земляные работы и вывоз грунта',5,1],['Основание: песок, щебень, бордюр, водоотвод',6,1.6],['Асфальтирование',7.4,0.6],['Шлагбаум и освещение',7.4,0.8],['Разметка, озеленение, приёмка',8,1]];
const gx=5.2,gw=7.5,nw=9; for(let i=0;i<nw;i++){s.addText('Нед. '+(i+1),{x:gx+i*gw/nw,y:1.4,w:gw/nw,h:0.4,align:'center',fontSize:11,color:M,fontFace:B,margin:0,isTextBox:true});
 s.addShape(p.shapes.LINE,{x:gx+i*gw/nw,y:1.85,w:0,h:4.6,line:{color:'E5E7EB',width:1}});}
st.forEach((r,i)=>{const y=1.95+i*0.64;
 s.addText(r[0],{x:0.6,y,w:4.5,h:0.5,fontFace:B,fontSize:13,color:T,margin:0,valign:'middle',isTextBox:true});
 s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:gx+r[1]*gw/nw,y:y+0.08,w:r[2]*gw/nw,h:0.36,fill:{color:i==0?'9CA3AF':Y},rectRadius:0.08});});
s.addText('Подготовка — 4 недели (апрель–май);  строительство — 5 недель, 25 рабочих дней (июнь — начало июля). Работы ведутся с 8:00 до 20:00, двор перекрывается частично.',{x:0.6,y:6.5,w:12.1,h:0.6,fontFace:B,fontSize:13,color:M,margin:0,isTextBox:true});

// 11 Result
s=p.addSlide(); s.background={color:D};
s.addText('Выполнение задач и итог',{x:0.6,y:0.4,w:12,h:0.8,fontFace:H,fontSize:34,bold:true,color:W,margin:0,isTextBox:true});
const done=['Территория обследована, порядок решения ОСС определён (ст. 44 ЖК РФ)','Определён объём демонтажа: газон 450 м², 6 деревьев, 120 м бордюра','Спроектировано покрытие на 20 новых мест: основание + асфальт в 2 слоя','Подобраны шлагбаум с GSM, 2 опоры освещения и водоотвод','Рассчитаны смета, ЗП, техника и график — 9 недель'];
done.forEach((t,i)=>{const y=1.45+i*0.78;
 s.addShape(p.shapes.OVAL,{x:0.6,y,w:0.55,h:0.55,fill:{color:Y}});
 s.addText('✓',{x:0.6,y,w:0.55,h:0.55,align:'center',valign:'middle',fontSize:18,bold:true,color:D,margin:0,isTextBox:true});
 s.addText([{text:'Задача '+(i+1)+' выполнена. ',options:{bold:true,color:Y}},{text:t,options:{color:W}}],{x:1.35,y,w:6.4,h:0.55,fontFace:B,fontSize:13,valign:'middle',margin:0,isTextBox:true});});
s.addText('18 → 38',{x:8.3,y:1.4,w:4.4,h:1.4,fontFace:H,fontSize:66,bold:true,color:Y,margin:0,align:'center',isTextBox:true});
s.addText('парковочных мест',{x:8.3,y:2.8,w:4.4,h:0.5,fontFace:B,fontSize:18,color:W,margin:0,align:'center',isTextBox:true});
s.addText(fmt(total)+' ₽  ·  9 недель',{x:8.3,y:3.6,w:4.4,h:0.5,fontFace:B,fontSize:18,bold:true,color:W,margin:0,align:'center',isTextBox:true});
s.addText('Цель достигнута: количество парковочных мест увеличено на 111 %.',{x:8.3,y:4.4,w:4.4,h:1.2,fontFace:B,fontSize:15,color:'D1D5DB',margin:0,align:'center',valign:'top',isTextBox:true});
s.addText('Спасибо за внимание!',{x:0.6,y:6.5,w:12,h:0.6,fontFace:H,fontSize:22,color:W,margin:0,isTextBox:true});
p.writeFile({fileName:__dirname+'/Парковка_Нахимова_20.pptx'});
