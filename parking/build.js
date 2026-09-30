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

const I=f=>__dirname+'/img/'+f;
let N=1; const T_=(s,t)=>title(s,t,++N);
const cap=(s,t,x,y,w)=>s.addText(t,{x,y,w,h:0.35,fontFace:B,fontSize:12,color:M,margin:0,isTextBox:true});
const src=(s,t)=>s.addText(t,{x:0.6,y:6.95,w:12.1,h:0.35,fontFace:B,fontSize:10,color:M,margin:0,isTextBox:true});
const NEW=107, MGN=2; // по схеме: фасад 38, площадка 20к2 18, газон у д. 22 42, западный въезд 9
const GR=[['F2C200','Вдоль фасада',38],['EA580C','Площадка у 20к2',18],['16A34A','У газона д. 22',42],['9333EA','У западного въезда',9]];

// 1 Title
let s=p.addSlide(); s.background={color:D};
s.addImage({path:I('pano.jpg'),x:7.0,y:0,w:6.33,h:7.5,sizing:{type:'cover',w:6.33,h:7.5}});
s.addText('Благоустройство общего имущества МКД',{x:0.7,y:1.0,w:6,h:0.5,fontFace:B,fontSize:16,color:Y,margin:0,isTextBox:true});
s.addText('Увеличение количества парковочных мест на придомовой территории',{x:0.7,y:1.6,w:6,h:2.4,fontFace:H,fontSize:32,bold:true,color:W,margin:0,valign:'top',isTextBox:true});
s.addText('ЖК «Морская рапсодия», Санкт-Петербург, ул. Нахимова, д. 20',{x:0.7,y:4.1,w:6,h:0.8,fontFace:B,fontSize:18,color:'E5E7EB',margin:0,isTextBox:true});
s.addText([{text:'Выполнил(а): ______________________',options:{breakLine:true}},{text:'Руководитель: ____________________',options:{breakLine:true}},{text:'2026 г.'}],{x:0.7,y:5.4,w:6,h:1.3,fontFace:B,fontSize:14,color:'9CA3AF',margin:0,isTextBox:true});

// 2 Contents
s=p.addSlide(); T_(s,'Содержание');
const toc=['Описание объекта','Объект на карте','Фото: фасады и улицы','Фото: двор','Актуальность','Цель и задачи','План парковочных мест','3D-модель двора','Что нужно и что получится','Техника','Заработная плата','Смета','Сроки и итог'];
toc.forEach((t,i)=>{const c=i<7?0:1,r=c?i-7:i,x=0.6+c*6.3,y=1.4+r*0.78;
 s.addShape(p.shapes.ROUNDED_RECTANGLE,{x,y,w:5.9,h:0.66,fill:{color:L},rectRadius:0.1});
 s.addShape(p.shapes.OVAL,{x:x+0.15,y:y+0.1,w:0.52,h:0.52,fill:{color:D}});
 s.addText(String(i+1),{x:x+0.15,y:y+0.1,w:0.52,h:0.52,align:'center',valign:'middle',fontSize:15,bold:true,color:Y,fontFace:B,margin:0,isTextBox:true});
 s.addText(t,{x:x+0.9,y,w:4.9,h:0.66,valign:'middle',fontSize:16,color:T,fontFace:B,margin:0,isTextBox:true});});

// 3 Object — реальные данные
s=p.addSlide(); T_(s,'Описание объекта');
const rows=[['Адрес','Санкт-Петербург, Василеостровский р-н, МО Гавань, ул. Нахимова, д. 20'],['Комплекс','ЖК «Морская рапсодия»'],['Год постройки','2011'],['Этажность','17–25 этажей, индивидуальный проект'],['Конструкция','кирпично-монолитный, перекрытия ж/б'],['Подъезды / лифты','6 подъездов, 13 лифтов'],['Квартир / жителей','400 квартир, 683 жителя'],['Площадь дома','общая 42 176 м², жилая 30 055 м²'],['Парковка','подземный паркинг + открытая парковка во дворе; двор закрыт шлагбаумами']];
s.addTable(rows.map(r=>[{text:r[0],options:{bold:true,color:T,fill:{color:L}}},{text:r[1],options:{color:T}}]),{x:0.6,y:1.4,w:7.0,colW:[2.2,4.8],fontFace:B,fontSize:12,rowH:0.52,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
s.addImage({path:I('pano.jpg'),x:7.9,y:1.4,w:4.8,h:2.71});
cap(s,'Фасад с ул. Нахимова (Яндекс Панорамы)',7.9,4.15,4.8);
s.addImage({path:I('yard_facade.jpg'),x:7.9,y:4.55,w:4.8,h:2.2,sizing:{type:'cover',w:4.8,h:2.2}});
src(s,'Источники: Домклик, ЦИАН (карточка дома), beyond.ru, Яндекс Карты — проверено в сентябре 2026 г.');

// 4 Map
s=p.addSlide(); T_(s,'Объект на карте');
s.addImage({path:I('sat.jpg'),x:0.6,y:1.4,w:5.9,h:4.08});
s.addImage({path:I('map_z17.png'),x:6.8,y:1.4,w:5.9,h:4.08});
cap(s,'Спутник: дом 20 на углу ул. Нахимова и Галерного проезда',0.6,5.55,5.9);
cap(s,'Схема квартала: двор между д. 20, 20к2 и 22, въезды со шлагбаумами',6.8,5.55,5.9);
src(s,'Источник: Яндекс Карты (yandex.ru/maps), 2026 г.');

// 5 Street photos
s=p.addSlide(); T_(s,'Фото: фасады и улицы');
s.addImage({path:I('pano_east.jpg'),x:0.6,y:1.4,w:6.0,h:3.69});
s.addImage({path:I('pano_galerny.jpg'),x:6.9,y:1.4,w:5.8,h:3.16});
cap(s,'Восточная часть дома, ул. Нахимова',0.6,5.15,6);
cap(s,'Вид с Галерного проезда: парковка вдоль проезда',6.9,4.62,5.8);
src(s,'Источник: Яндекс Панорамы, 2026 г.');

// 6 Yard photos
s=p.addSlide(); T_(s,'Фото: двор дома');
s.addImage({path:I('yard_west.jpg'),x:0.6,y:1.35,w:5.95,h:2.5,sizing:{type:'cover',w:5.95,h:2.5}});
s.addImage({path:I('yard_facade.jpg'),x:6.75,y:1.35,w:5.95,h:2.5,sizing:{type:'cover',w:5.95,h:2.5}});
cap(s,'Внутридворовый проезд: машины стоят по обе стороны',0.6,3.9,5.95);
cap(s,'Южный фасад и палисадник вдоль проезда',6.75,3.9,5.95);
s.addImage({path:I('yard_winter.jpg'),x:0.6,y:4.35,w:5.95,h:2.1,sizing:{type:'cover',w:5.95,h:2.1}});
s.addImage({path:I('yard_entry.jpg'),x:6.75,y:4.35,w:5.95,h:2.1,sizing:{type:'cover',w:5.95,h:2.1}});
cap(s,'Двор зимой: стихийная парковка на проездах',0.6,6.5,5.95);
cap(s,'Восточный въезд и огороженная парковка',6.75,6.5,5.95);

// 7 Relevance
s=p.addSlide(); T_(s,'Актуальность и понятие благоустройства');
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:0.6,y:1.5,w:6.2,h:2.3,fill:{color:D},rectRadius:0.12});
s.addText([{text:'Благоустройство',options:{bold:true,color:Y,breakLine:true}},{text:'— комплекс мероприятий по содержанию и развитию территории, направленных на повышение комфорта и безопасности жителей (п. 36 ст. 1 ГрК РФ). Придомовая территория входит в состав общего имущества МКД (ст. 36 ЖК РФ), решение о её изменении принимает общее собрание собственников (ст. 44 ЖК РФ).',options:{color:W}}],{x:0.9,y:1.6,w:5.7,h:2.1,fontFace:B,fontSize:14,valign:'middle',margin:0,isTextBox:true});
[['400','квартир'],['683','жителя'],['+'+NEW,'мест по проекту']].forEach((k,i)=>{const x=0.6+i*2.1;
 s.addText(k[0],{x,y:4.2,w:2,h:0.9,fontFace:H,fontSize:44,bold:true,color:T,margin:0,isTextBox:true});
 s.addText(k[1],{x,y:5.1,w:1.9,h:0.6,fontFace:B,fontSize:13,color:M,margin:0,valign:'top',isTextBox:true});});
s.addText('Что видно на снимках и панорамах',{x:7.3,y:1.5,w:5.4,h:0.5,fontFace:B,fontSize:20,bold:true,color:T,margin:0,isTextBox:true});
s.addText(['Машины стоят вдоль внутридворового проезда с обеих сторон — проезд сужается','Зимой парковка стихийная, без разметки','Открытая парковка у д. 20к2 заполнена','Машины паркуются и вдоль Галерного проезда','Для 400 квартир мест во дворе недостаточно'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:7.3,y:2.1,w:5.4,h:3.8,fontFace:B,fontSize:15,color:T,paraSpaceAfter:10,margin:0,valign:'top',isTextBox:true});

// 8 Goal & tasks
s=p.addSlide(); T_(s,'Цель и задачи проекта');
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:0.6,y:1.4,w:12.1,h:1.2,fill:{color:Y},rectRadius:0.12});
s.addText([{text:'ЦЕЛЬ:  ',options:{bold:true}},{text:'обустроить '+NEW+' новых парковочных мест во дворе МКД ул. Нахимова, 20 и поставить шлагбаум на восточном въезде.'}],{x:0.9,y:1.4,w:11.6,h:1.2,valign:'middle',fontFace:B,fontSize:20,color:D,margin:0,isTextBox:true});
const tasks=['Обследовать двор по снимкам и на месте, получить решение ОСС','Демонтировать газон ≈ 1 340 м² в зонах новых мест','Устроить основание и асфальт на '+NEW+' мест','Поставить шлагбаум, освещение, водоотвод, разметку','Рассчитать смету, зарплату, технику и график'];
tasks.forEach((t,i)=>{const x=0.6+i*2.46;
 s.addShape(p.shapes.ROUNDED_RECTANGLE,{x,y:3.0,w:2.25,h:3.6,fill:{color:L},rectRadius:0.1});
 s.addShape(p.shapes.OVAL,{x:x+0.2,y:3.2,w:0.7,h:0.7,fill:{color:D}});
 s.addText(String(i+1),{x:x+0.2,y:3.2,w:0.7,h:0.7,align:'center',valign:'middle',fontSize:20,bold:true,color:Y,fontFace:B,margin:0,isTextBox:true});
 s.addText('Задача '+(i+1),{x:x+0.2,y:4.05,w:1.9,h:0.4,fontSize:13,bold:true,color:M,fontFace:B,margin:0,isTextBox:true});
 s.addText(t,{x:x+0.2,y:4.45,w:1.9,h:2.0,fontSize:14,color:T,fontFace:B,margin:0,valign:'top',isTextBox:true});});

// 9 Plan
s=p.addSlide(); T_(s,'План парковочных мест во дворе');
s.addImage({path:I('plan_map.jpg'),x:0.6,y:1.35,w:8.1,h:5.61});
s.addText('Новые места: '+NEW,{x:9.0,y:1.35,w:3.7,h:0.45,fontFace:B,fontSize:18,bold:true,color:T,margin:0,isTextBox:true});
GR.concat([['2563EB','Для МГН (в ряду у фасада)',MGN],['DC2626','Новый шлагбаум (восточный въезд)',1]]).forEach((r,i)=>{const y=1.95+i*0.5;
 s.addShape(p.shapes.RECTANGLE,{x:9.0,y:y+0.07,w:0.36,h:0.28,fill:{color:r[0]}});
 s.addText(r[1]+(i<4?' — '+r[2]:''),{x:9.5,y,w:3.3,h:0.42,fontFace:B,fontSize:12,color:T,margin:0,valign:'middle',isTextBox:true});});
s.addText(['Места 2,5 × 5 м, перпендикулярно проезду','Проезды 6 м сохраняются','Площадь нового покрытия ≈ 1 340 м²','Размещение — по схеме заказчика'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:9.0,y:5.05,w:3.7,h:1.8,fontFace:B,fontSize:12,color:T,paraSpaceAfter:4,margin:0,valign:'top',isTextBox:true});
src(s,'Подложка: Яндекс Карты. Масштаб 1 px ≈ 0,3 м. Схема — проектное предложение, требует геодезической съёмки и решения ОСС.');

// 9b 3D
s=p.addSlide(); T_(s,'3D-модель двора после работ');
s.addImage({path:I('3d_east.png'),x:0.6,y:1.35,w:7.6,h:4.28});
s.addImage({path:I('3d_top.png'),x:8.45,y:1.35,w:4.25,h:2.39});
s.addImage({path:I('3d_yard.png'),x:8.45,y:3.95,w:4.25,h:2.39});
cap(s,'Вид с юго-востока: ряды у фасада, у газона и площадка 20к2',0.6,5.7,7.6);
cap(s,'Вид сверху',8.45,3.75,4.25);cap(s,'Вид с юга',8.45,6.36,4.25);
src(s,'Модель: three.js, здания — упрощённые объёмы по контурам Яндекс Карт. Интерактивная версия — parking/3d_model.html.');

// 10 Before / after
s=p.addSlide(); T_(s,'Что нужно и что получится');
s.addText('БЫЛО',{x:0.6,y:1.35,w:5.8,h:0.4,fontFace:B,fontSize:18,bold:true,color:M,margin:0,isTextBox:true});
s.addImage({path:I('yard_west.jpg'),x:0.6,y:1.8,w:5.8,h:2.3,sizing:{type:'cover',w:5.8,h:2.3}});
s.addText('СТАНЕТ',{x:6.9,y:1.35,w:5.8,h:0.4,fontFace:B,fontSize:18,bold:true,color:G,margin:0,isTextBox:true});
lot(s,6.9,1.8,5.8,1.9,36,null,NEW+' новых мест (в т.ч. '+MGN+' для МГН)');
s.addShape(p.shapes.RECTANGLE,{x:6.9,y:1.8,w:5.8/36*MGN,h:1.9,fill:{color:'2563EB'}});
s.addText('Что нужно',{x:0.6,y:4.35,w:5.8,h:0.4,fontFace:B,fontSize:16,bold:true,color:T,margin:0,isTextBox:true});
s.addText(['Решение ОСС (≥ 2/3 голосов) и проект','Геодезическая съёмка и согласования','Подрядчик, техника, материалы','≈ 9 недель (подготовка + работы)'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:0.6,y:4.8,w:5.8,h:2.1,fontFace:B,fontSize:14,color:T,paraSpaceAfter:6,margin:0,valign:'top',isTextBox:true});
s.addText('Что получится',{x:6.9,y:4.35,w:5.8,h:0.4,fontFace:B,fontSize:16,bold:true,color:T,margin:0,isTextBox:true});
s.addText(['+'+NEW+' новых мест в 4 зонах','Шлагбаум на восточном въезде','Свободный проезд для скорой и пожарной техники','Освещение, водоотвод, разметка','Компенсационное озеленение'].map((t,i,a)=>({text:t,options:{bullet:true,breakLine:i<a.length-1}})),{x:6.9,y:4.8,w:5.8,h:2.1,fontFace:B,fontSize:14,color:T,paraSpaceAfter:6,margin:0,valign:'top',isTextBox:true});

// data (расчёт от площади по схеме: 265 м², ряд 54 м)
const A=1340, Ldep=0.65*A;
const tech=[['Экскаватор-погрузчик JCB 3CX (с машинистом)','маш.-ч',64,3200],['Самосвал КАМАЗ 65115 (вывоз грунта '+Math.round(Ldep)+' м³)','рейс',87,6500],['Каток дорожный 6 т','маш.-ч',40,2800],['Асфальтоукладчик','маш.-ч',24,6500],['Виброплита, инструмент','сут',25,1500]];
const staff=[['Прораб','1',35,4500],['Дорожные рабочие','6',30,3500],['Разнорабочие','3',20,2800],['Электромонтажник','1',8,4000]];
const ts=tech.map(r=>r[2]*r[3]), techSum=ts.reduce((a,b)=>a+b);
const ss=staff.map(r=>r[1]*r[2]*r[3]), fot=ss.reduce((a,b)=>a+b), ins=fot*0.3, zp=fot+ins;
const mat=[['Демонтаж газона '+A+' м², выемка грунта '+Math.round(Ldep)+' м³',A*60+Math.round(Ldep)*650],['Геотекстиль '+A+' м², песок '+Math.round(A*0.3)+' м³, щебень '+Math.round(A*0.25)+' м³',A*90+Math.round(A*0.3)*1400+Math.round(A*0.25)*2600],['Асфальтобетон в 2 слоя, '+A+' м²',A*1250],['Бордюр БР 100.30.15 с установкой, 420 м',420*1300],['Водоотвод: лотки 90 м + 3 дождеприёмника',290000],['Освещение: 6 опор LED с кабелем',330000],['Разметка '+NEW+' мест (термопластик) + знаки МГН',NEW*1400+12000],['Шлагбаум автомат. с GSM на восточном въезде + монтаж',245000],['Компенсационное озеленение',40000],['Геодезия, проект и согласования',90000]];
const matSum=mat.reduce((a,r)=>a+r[1],0);
const sub=matSum+techSum+zp, res=sub*0.05, total=sub+res;
console.log({techSum,fot,zp,matSum,total});
const note='Расчётные значения: объёмы — по площади со схемы, цены — средние рыночные для СПб, 2026 г.';

// 11 Tech
s=p.addSlide(); T_(s,'Техника и механизмы');
s.addTable([[ 'Техника','Ед.','Кол-во','Цена, ₽','Сумма, ₽'].map(t=>({text:t,options:{bold:true,color:W,fill:{color:D}}}))].concat(tech.map((r,i)=>[r[0],r[1],String(r[2]),fmt(r[3]),fmt(ts[i])])).concat([[{text:'Итого техника',options:{bold:true,colspan:4}},{text:fmt(techSum),options:{bold:true}}]]),{x:0.6,y:1.5,w:8.4,colW:[4.2,0.9,1.0,1.1,1.2],fontFace:B,fontSize:13,color:T,rowH:0.55,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:9.4,y:1.5,w:3.3,h:2.4,fill:{color:D},rectRadius:0.12});
s.addText(fmt(techSum)+' ₽',{x:9.6,y:1.7,w:2.9,h:1,fontFace:H,fontSize:30,bold:true,color:Y,margin:0,isTextBox:true});
s.addText('аренда техники с операторами',{x:9.6,y:2.7,w:2.9,h:0.9,fontFace:B,fontSize:14,color:W,margin:0,valign:'top',isTextBox:true});
src(s,note);

// 12 Salary
s=p.addSlide(); T_(s,'Расчёт заработной платы');
s.addTable([['Должность','Чел.','Дней','Ставка ₽/день','ФОТ, ₽'].map(t=>({text:t,options:{bold:true,color:W,fill:{color:D}}}))].concat(staff.map((r,i)=>[r[0],r[1],String(r[2]),fmt(r[3]),fmt(ss[i])])).concat([[{text:'Фонд оплаты труда',options:{bold:true,colspan:4}},{text:fmt(fot),options:{bold:true}}],[{text:'Страховые взносы 30 %',options:{colspan:4}},fmt(ins)],[{text:'Итого зарплата с взносами',options:{bold:true,colspan:4,fill:{color:Y}}},{text:fmt(zp),options:{bold:true,fill:{color:Y}}}]]),{x:0.6,y:1.5,w:8.4,colW:[3.6,0.8,0.9,1.6,1.5],fontFace:B,fontSize:13,color:T,rowH:0.52,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
s.addText('Формула',{x:9.4,y:1.5,w:3.3,h:0.4,fontFace:B,fontSize:16,bold:true,color:T,margin:0,isTextBox:true});
s.addText('ФОТ = численность × дни × дневная ставка\n\nВзносы = ФОТ × 30 %\n\nБригада: 11 человек.',{x:9.4,y:2.0,w:3.3,h:3.5,fontFace:B,fontSize:14,color:T,margin:0,valign:'top',isTextBox:true});
src(s,note);

// 13 Smeta
s=p.addSlide(); T_(s,'Смета проекта');
s.addTable([[{text:'Материалы и работы',options:{bold:true,color:W,fill:{color:D}}},{text:'Сумма, ₽',options:{bold:true,color:W,fill:{color:D}}}]].concat(mat.map(r=>[r[0],fmt(r[1])])),{x:0.6,y:1.4,w:7.4,colW:[5.8,1.6],fontFace:B,fontSize:12,color:T,rowH:0.4,border:{type:'solid',color:'E5E7EB',pt:1},valign:'middle'});
[['Материалы и работы',matSum],['Техника',techSum],['Зарплата с взносами',zp],['Непредвиденные 5 %',res]].forEach((r,i)=>{s.addText(r[0],{x:8.5,y:1.45+i*0.6,w:2.5,h:0.5,fontFace:B,fontSize:14,color:T,margin:0,valign:'middle',isTextBox:true});
 s.addText(fmt(r[1])+' ₽',{x:10.9,y:1.45+i*0.6,w:1.8,h:0.5,fontFace:B,fontSize:14,bold:true,color:T,align:'right',margin:0,valign:'middle',isTextBox:true});});
s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:8.5,y:4.05,w:4.2,h:1.5,fill:{color:D},rectRadius:0.12});
s.addText('ИТОГО ПО СМЕТЕ',{x:8.75,y:4.15,w:3.8,h:0.4,fontFace:B,fontSize:13,bold:true,color:W,margin:0,isTextBox:true});
s.addText(fmt(total)+' ₽',{x:8.75,y:4.55,w:3.8,h:0.8,fontFace:H,fontSize:30,bold:true,color:Y,margin:0,isTextBox:true});
s.addText([{text:'≈ '+fmt(total/400)+' ₽',options:{bold:true}},{text:' с квартиры (400 кв.) или '},{text:'≈ '+fmt(total/NEW)+' ₽',options:{bold:true}},{text:' за одно новое место.'}],{x:8.5,y:5.75,w:4.2,h:1.0,fontFace:B,fontSize:12,color:T,margin:0,valign:'top',isTextBox:true});
src(s,note);

// 14 Gantt
s=p.addSlide(); T_(s,'Сроки выполнения работ');
const st=[['ОСС, геодезия, проект, согласования',0,4],['Демонтаж газона, земляные работы, вывоз',4,1.6],['Основание: песок, щебень, бордюр, водоотвод',5.4,1.8],['Асфальтирование',7.2,0.8],['Шлагбаум и освещение',6.8,1.2],['Разметка, озеленение, приёмка',8,1]];
const gx=5.2,gw=7.5,nw=9; for(let i=0;i<nw;i++){s.addText('Нед. '+(i+1),{x:gx+i*gw/nw,y:1.4,w:gw/nw,h:0.4,align:'center',fontSize:11,color:M,fontFace:B,margin:0,isTextBox:true});
 s.addShape(p.shapes.LINE,{x:gx+i*gw/nw,y:1.85,w:0,h:4.2,line:{color:'E5E7EB',width:1}});}
st.forEach((r,i)=>{const y=1.95+i*0.64;
 s.addText(r[0],{x:0.6,y,w:4.5,h:0.5,fontFace:B,fontSize:13,color:T,margin:0,valign:'middle',isTextBox:true});
 s.addShape(p.shapes.ROUNDED_RECTANGLE,{x:gx+r[1]*gw/nw,y:y+0.08,w:r[2]*gw/nw,h:0.36,fill:{color:i==0?'9CA3AF':Y},rectRadius:0.08});});
s.addText('Подготовка — 4 недели; строительство — 5 недель (25 рабочих дней), по зонам. Работы с 8:00 до 20:00, проезд во дворе перекрывается частично.',{x:0.6,y:6.3,w:12.1,h:0.6,fontFace:B,fontSize:13,color:M,margin:0,isTextBox:true});

// 15 Result
s=p.addSlide(); s.background={color:D};
s.addText('Выполнение задач и итог',{x:0.6,y:0.4,w:12,h:0.8,fontFace:H,fontSize:34,bold:true,color:W,margin:0,isTextBox:true});
const done=['Двор обследован по снимкам и панорамам Яндекс Карт','Размещено '+NEW+' новых мест в 4 зонах двора (≈ 1 340 м²)','Спроектировано покрытие: основание + асфальт в 2 слоя','Шлагбаум на въезде, освещение, водоотвод, места для МГН','Рассчитаны смета, ЗП, техника и график — 9 недель'];
done.forEach((t,i)=>{const y=1.45+i*0.78;
 s.addShape(p.shapes.OVAL,{x:0.6,y,w:0.55,h:0.55,fill:{color:Y}});
 s.addText('✓',{x:0.6,y,w:0.55,h:0.55,align:'center',valign:'middle',fontSize:18,bold:true,color:D,margin:0,isTextBox:true});
 s.addText([{text:'Задача '+(i+1)+' выполнена. ',options:{bold:true,color:Y}},{text:t,options:{color:W}}],{x:1.35,y,w:6.4,h:0.55,fontFace:B,fontSize:13,valign:'middle',margin:0,isTextBox:true});});
s.addText('+'+NEW,{x:8.3,y:1.4,w:4.4,h:1.4,fontFace:H,fontSize:72,bold:true,color:Y,margin:0,align:'center',isTextBox:true});
s.addText('новых парковочных мест',{x:8.3,y:2.8,w:4.4,h:0.5,fontFace:B,fontSize:18,color:W,margin:0,align:'center',isTextBox:true});
s.addText(fmt(total)+' ₽  ·  9 недель',{x:8.3,y:3.6,w:4.4,h:0.5,fontFace:B,fontSize:18,bold:true,color:W,margin:0,align:'center',isTextBox:true});
s.addText('Цель достигнута: +'+NEW+' мест, въезд под контролем шлагбаума.',{x:8.3,y:4.4,w:4.4,h:1.2,fontFace:B,fontSize:15,color:'D1D5DB',margin:0,align:'center',valign:'top',isTextBox:true});
s.addText('Спасибо за внимание!',{x:0.6,y:6.5,w:12,h:0.6,fontFace:H,fontSize:22,color:W,margin:0,isTextBox:true});
p.writeFile({fileName:__dirname+'/Парковка_Нахимова_20.pptx'});
