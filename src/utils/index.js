export const handleHomeRedirect = (app, flows, flow, handle) => {
    const activeUser = app.users.find(u => u.handle === handle);
    const success = activeUser && flows[flow].routes.filter(route => app.success.some(success => success.handle === activeUser.handle && success.page === route)).pop();
    const notCertified = activeUser && activeUser.business && !activeUser.certified && app.success.some(success => success.handle === activeUser.handle && success.page === '/certify');
    const next = success && flows[flow].routes.indexOf(success) !== flows[flow].routes.length - 1 ? 1 : 0;
    return notCertified ? '/certify' : success ? flows[flow].routes[flows[flow].routes.indexOf(success) + next] : flows[flow].routes[0];
};

export const capitalize = (str) => str.toString().charAt(0).toUpperCase() + str.toString().slice(1);

export const bytesToSize = (size) => {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

export const formatDateAndTime = (timestamp, showTime) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (1 + date.getMonth()).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  if(showTime) {
    const time = date.toLocaleTimeString('en-US');
    return `${month}/${day}/${year} ${time}`;
  }
  return `${month}/${day}/${year}`;
};

export const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
