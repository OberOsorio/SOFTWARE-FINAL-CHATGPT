export const modules = [
  {id:"administrativa",title:"Gestión Administrativa",subtitle:"Nómina, Presupuesto CNE, Auditoría, Roles y Seguridad",features:["Roles y privilegios RBAC","Estructura de líderes y CRM","Presupuesto CNE y topes","Directivos, testigos y jurados"]},
  {id:"estrategica",title:"Gestión Estratégica",subtitle:"Diagnóstico 360° AI, Programa de Gobierno, DOFA, Narrativa y Discursos",features:["Diagnóstico 360° y territorial","Programa, propuestas y plan","Matriz DOFA y candidato","Narrativa y análisis AI"]},
  {id:"territorial",title:"Gestión Territorial",subtitle:"Votantes, mapa de calor, testigos, encuestas y jurados",features:["Registro de votantes por comuna","Mapa de votos y sectores","Reportes Día E y E-14","Encuestas y control de jurados"]}
] as const;
export const voters=[
 {name:"María Fernanda Ruiz",id:"1085294312",zone:"Comuna 4",leader:"Carlos Gómez",status:"Confirmado"},
 {name:"Jorge Luis Martínez",id:"73184592",zone:"Comuna 2",leader:"Ana Torres",status:"Pendiente"},
 {name:"Diana Carolina Pérez",id:"1065124871",zone:"Zona rural",leader:"Miguel Díaz",status:"Confirmado"}
];
export const expenses=[
 {concept:"Publicidad digital",category:"Propaganda",amount:12400000,date:"2026-08-18"},
 {concept:"Logística evento",category:"Actos públicos",amount:6800000,date:"2026-08-21"},
 {concept:"Transporte territorial",category:"Administración",amount:3250000,date:"2026-08-25"}
];
