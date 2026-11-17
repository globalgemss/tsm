import React from 'react';
import './civic-masthead.css';

/**
 * Public civic masthead. Officials are intentionally placeholders until the
 * committee verifies their names, positions, photos and permission to publish.
 * Never present an AI portrait as a real elected official.
 */
export const civicOfficials={
  mayor:{title:'नगर प्रमुख',name:'आधिकारिक नाम राखिनेछ',office:'सम्बन्धित नगरपालिका',photo:''},
  wardChair:{title:'वडा अध्यक्ष',name:'आधिकारिक नाम राखिनेछ',office:'सम्बन्धित वडा कार्यालय',photo:''}
};

function Official({person,side}){
  return <div className={'civic-official civic-official-'+side}>
    <div className="civic-portrait" aria-label={person.photo?person.title+'को फोटो':person.title+'को फोटो उपलब्ध छैन'}>
      {person.photo?<img loading="lazy" src={person.photo} alt={person.name+' — '+person.title}/>:<svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="24" r="12" stroke="currentColor" strokeWidth="2"/><path d="M11 57c2-14 9-21 21-21s19 7 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
    </div>
    <div className="civic-official-info">
      <span className="civic-office-label">{person.title}</span>
      <strong>{person.name}</strong>
      <small>{person.office}</small>
    </div>
  </div>
}
export default function CivicMasthead({committeeName,ward,children}){
  return <div className="civic-masthead">
    <div className="civic-masthead-inner">
      <Official person={civicOfficials.mayor} side="left"/>
      <a className="civic-identity" href="#home" aria-label="टोल सुधार समिति मुख्यपृष्ठ">
        <span className="civic-identity-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none"><path d="M32 4 55 14v20c0 13-23 25-23 25S9 47 9 34V14Z" stroke="currentColor" strokeWidth="2"/><path d="M18 30 32 18l14 12v17H18Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/><path d="M28 47V34h8v13" stroke="currentColor" strokeWidth="2"/><path d="M17 13h30" stroke="#c49a43" strokeWidth="2"/></svg>
        </span>
        <span className="civic-identity-text">
          <span className="civic-identity-kicker">समुदायको एकता, विकासको प्रतिबद्धता</span>
          <strong>{committeeName} टोल सुधार समिति</strong>
          <small>सफा <i/> सुरक्षित <i/> व्यवस्थित <i/> समृद्ध टोल</small>
          <span className="civic-identity-ward">नमुना नगरपालिका · वडा नं. {ward}</span>
        </span>
      </a>
      <Official person={civicOfficials.wardChair} side="right"/>
    </div>
    {children}
  </div>
}
