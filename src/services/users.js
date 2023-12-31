export { getProfile, updateProfile, loginUser, registerUser, loginWithToken, isLogged, logout, forgotPassword };

import { loginSupabase, signUpSupabase, logoutSupabase, recoverPasswordSupabase, getData, updateData, createData, fileRequest, getFileRequest } from "./PeticionesApi.js";


function expirationDate(expires_in){
    return Math.floor(Date.now() / 1000)+expires_in; 
}

async function loginUser(email, password) {
    let status = { success: false };

    try {
        // Realizar la autenticación con Supabase
        let dataLogin = await loginSupabase(email, password);
        console.log(dataLogin);
        
        localStorage.setItem("access_token", dataLogin.access_token); //Guardo en LocalStorage el token
        /*let user = await buscarPerfil("profiles?select=*&id=eq."+dataLogin.user.id,localStorage.getItem('access_token'))*/
        localStorage.setItem("uid", dataLogin.user.id);
        localStorage.setItem("email", dataLogin.user.email);
        localStorage.setItem("expirationDate",expirationDate(dataLogin.expires_in));
        
        status.success = true;

    } catch (err) {
        console.log(err);

        status.success = false;
        status.errorText = err.error_description || "Error desconocido al iniciar sesión.";
        document.getElementById('loginError').innerText = status.errorText
    }

    return status;
}

function loginWithToken(access_token,expires_in){
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("expirationDate",expirationDate(expires_in));
}

function isLogged(){
    if(localStorage.getItem('access_token')){
        if(localStorage.getItem('expirationDate') > Math.floor(Date.now() / 1000))
        {
            return true;
        }
    }
    return false;
}

async function registerUser(email, password) {
    let status = { success: false };
    
    try {
        let dataRegister = await signUpSupabase(email, password);
        console.log(dataRegister);
        status.success = true;
    } catch (err) {
        console.log(err);
        status.success = false;
        status.errorText = err.error_description || "Error desconocido al registrar usuario.";
        document.getElementById('registerError').innerText = status.errorText;
    }
    
    return status;
}

async function logout() {
    logoutSupabase(localStorage.getItem('access_token')).then((lOData) => {
        console.log(lOData);
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('uid');
}

async function forgotPassword(email){
    let responseForgot = await recoverPasswordSupabase(email);
    console.log(responseForgot);
}

async function updateProfile(profile) {
    const access_token = localStorage.getItem('access_token');
    const uid = localStorage.getItem('uid');
  
    const formImg = new FormData();
    formImg.append('avatar', profile.avatar, 'avatarProfile.png');
  
    console.log(formImg);
  
    const avatarResponse = await fileRequest(`/storage/v1/object/avatars/avatar${uid}.png`, formImg, access_token);
  
    // console.log(avatarResponse);
    profile.avatar_url = avatarResponse.urlAvatar;
    delete profile.avatar;
  
    const responseUpdate = await updateData(`profiles?id=eq.${uid}&select=*`, access_token, profile);
    // console.log(responseUpdate);
    // createData('profiles',access_token,profile);
  }
  
  async function getProfile() {
    const access_token = localStorage.getItem('access_token');
    const uid = localStorage.getItem('uid');
    const responseGet = await getData(`profiles?id=eq.${uid}&select=*`, access_token);
    console.log(responseGet);
  
    if (responseGet && responseGet.length > 0) {
      const { avatar_url } = responseGet[0];
      responseGet[0].avatar_blob = false;
  
      if (avatar_url) {
        const imageBlob = await getFileRequest(avatar_url, access_token);
        console.log(imageBlob);
  
        if (imageBlob instanceof Blob) {
          responseGet[0].avatar_blob = URL.createObjectURL(imageBlob);
        }
      }
    }
  
    return responseGet;
  }
  
  