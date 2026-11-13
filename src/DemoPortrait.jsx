import React from 'react';
import './photos.css';
export default function DemoPortrait({name='',index,small=false}){
 const n=index??Array.from(name).reduce((a,c)=>a+c.codePointAt(0),0)%8;
 return <span role="img" aria-label={`${name} — काल्पनिक AI नमुना फोटो`} title="काल्पनिक AI नमुना फोटो" className={'demo-portrait'+(small?' portrait-small':'')} style={{backgroundPosition:`${(n%4)*100/3}% ${Math.floor(n/4)*100}%`}}/>;
}
