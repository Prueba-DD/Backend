import { getFacebookConfig } from '../config/facebook.config.js';

const getGraphApiBaseUrl = () => {
  const { graphApiVersion } = getFacebookConfig();
  return `https://graph.facebook.com/${graphApiVersion}`;
};

const normalizeFacebookProfile = (profile) => {
  const fullName = profile.name || '';
  const [firstName = '', ...lastNameParts] = fullName.trim().split(' ').filter(Boolean);

  return {
    facebookId: profile.id,
    email: profile.email,
    nombre: profile.first_name || firstName || '',
    apellido: profile.last_name || lastNameParts.join(' ') || '',
    avatar_url: profile.picture?.data?.url || null,
  };
};

export const generateFacebookAuthUrl = () => {
  try {
    const config = getFacebookConfig();
    const params = new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.callbackUrl,
      scope: 'email,public_profile',
      response_type: 'code',
    });

    return {
      success: true,
      authUrl: `https://www.facebook.com/${config.graphApiVersion}/dialog/oauth?${params.toString()}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const exchangeFacebookCodeForToken = async (code) => {
  try {
    const config = getFacebookConfig();
    const params = new URLSearchParams({
      client_id: config.appId,
      client_secret: config.appSecret,
      redirect_uri: config.callbackUrl,
      code,
    });

    const response = await fetch(`${getGraphApiBaseUrl()}/oauth/access_token?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(data?.error?.message || 'No fue posible obtener el access_token de Facebook.');
    }

    return {
      success: true,
      accessToken: data.access_token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getFacebookUserInfo = async (accessToken) => {
  try {
    const params = new URLSearchParams({
      fields: 'id,name,first_name,last_name,email,picture',
      access_token: accessToken,
    });

    const response = await fetch(`${getGraphApiBaseUrl()}/me?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'No fue posible obtener informacion de Facebook.');
    }

    const userInfo = normalizeFacebookProfile(data);
    if (!userInfo.email) {
      throw new Error('Facebook no retorno un email para el usuario.');
    }

    return {
      success: true,
      ...userInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
