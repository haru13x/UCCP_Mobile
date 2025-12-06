const appJson = require('./app.json');

module.exports = ({ config }) => {
  const isProd =
    process.env.APP_ENV === 'production' ||
    process.env.EAS_BUILD_PROFILE === 'production' ||
    process.env.NODE_ENV === 'production';

  const prodIcon = './assets/uccp_logo.png';
  const expo = appJson.expo || {};

  const icon = isProd ? prodIcon : expo.icon;
  const androidAdaptive = {
    ...(expo.android && expo.android.adaptiveIcon ? expo.android.adaptiveIcon : {}),
    foregroundImage: isProd
      ? prodIcon
      : expo.android && expo.android.adaptiveIcon
        ? expo.android.adaptiveIcon.foregroundImage
        : undefined,
  };

  return {
    expo: {
      ...expo,
      icon,
      android: {
        ...expo.android,
        adaptiveIcon: androidAdaptive,
      },
    },
  };
};