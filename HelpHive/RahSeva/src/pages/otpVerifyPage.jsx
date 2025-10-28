import React,{useState} from 'react';

const OtpVerifyModel=({isOpen,isVerify,onClose})=>{
    const [otp,setOtp]=useState('');
    const handleSubmit=(e)=>{
        e.preventDefault();
        isVerify(otp);
    }

    if(!isOpen) return null;
    return (
<div>
    <p>
        hello Suman How are you
    </p>
    <div>
        <p>hello</p>
    </div>
</div>
    )
};

export default OtpVerifyModel;