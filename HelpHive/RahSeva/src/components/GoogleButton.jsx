import {GoogleLogin} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function GoogleSignInButton({onSuccess,onError}){
    const handleSuccess=(credentialResponse)=>{ 
          const decoded=jwtDecode(credentialResponse.credential);
          console.log("Google Registered Data:",decoded);
          onSuccess(decoded);
    };
    
    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={onError}
                size="large"
                theme="outline"
                text="continue_with"
                shape="rectangular"
                useOneTap={false}
            />
        </div>
    )
}

export default GoogleSignInButton;