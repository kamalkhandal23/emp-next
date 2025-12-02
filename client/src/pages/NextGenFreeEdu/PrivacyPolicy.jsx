import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="p-10 max-w-6xl mx-auto bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-7" style={{color: 'black'}}>Privacy Policy</h1>
      <p className="text-2xl font-bold mb-6 ">
        LifeBox NextGen Pvt. Ltd. <br /></p>
      <p className="text-xl font-bold mb-5">
        Effective Date: 02 December 2025  <br />
      </p>
      <p>
        LifeBox NextGen Pvt. Ltd. (“we”, “our”, “us”) is commited to protecting the privacy of every user who accesses our platorms under the brands <strong>LifeBox NextGen</strong> and <strong>NextGenFreedu</strong>. This Privacy Policy explains how we collect, use, store, and safeguard your information on while you use services such as our digital diary, emotional tracker, vault, ERP systems, CRM, attendance portal, examination portal, learning platforms, and mobile or web applications. 
        <br /> <br />
       We collect personal information including your name, email address, phone number, student or course details, and other information you voluntarily submit. Additionally, we automatically collect technical information such as device details, browser type, IP address, access logs, exam activity (including fullscreen usage and tab switching), and attendance submissions. For users of the LifeBox NextGen diary and vault, we store personal entries, emotional tracking data, and uploaded files or documents. These are encrypted and treated as strictly private. 
       <br /> <br />
        We use the information collected to provide, maintain, and improve our services; personalize 
        your experience; ensure secure usage; generate attendance and exam-related reports; 
        process payments; troubleshoot issues; protect against fraudulent or unauthorized activities; 
        and comply with legal obligations. Payment information such as transaction IDs and invoice 
        details is collected when you subscribe to premium features or pay for services, but we never 
        store sensitive payment credentials like card numbers or UPI PINs. <br />  <br />     
        Your data is stored using secure encryption technologies and is protected through strict 
        access controls, monitored systems, and regular security audits. Only authorized personnel 
        may access specific user data for legitimate operational purposes. We never sell, rent, or 
        trade your information to external parties. Data may be shared only with trusted service 
        providers such as cloud hosting platforms, email systems, and payment gateways, and only to 
        the extent required to operate our services. Attendance records, exam logs, and payment 
        documents may be retained as long as necessary for academic and legal compliance.  <br /> <br />
        You have the right to access, edit, export, or request dele on of your personal data at any 
        time. Once your account is deleted, all diary entries, vault content, personal logs, and 
        associated records will be permanently removed from our systems, except where retention is 
        legally required. If you would like to exercise your rights or have any privacy-related 
        concerns, you may contact us <strong>careers@lifeboxnextgen.co.site</strong>.  <br /> <br />
        This Privacy Policy may be updated periodically to reflect changes in technology, regulatory 
        requirements, or service enhancements. Users will be notified of major changes through 
        email or in-app messaging. Continued use of our services after updates constitutes 
        acceptance of the revised policy.
      </p>
    </div>
  );
}
