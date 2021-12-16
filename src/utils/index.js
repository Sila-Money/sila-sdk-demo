export const handleHomeRedirect = (app, flows, flow, handle) => {
    const activeUser = app.users.find(u => u.handle === handle);
    const success = activeUser && flows[flow].routes.filter(route => app.success.some(success => success.handle === activeUser.handle && success.page === route)).pop();
    const notCertified = activeUser && activeUser.business && !activeUser.certified && app.success.some(success => success.handle === activeUser.handle && success.page === '/certify');
    const next = success && flows[flow].routes.indexOf(success) !== flows[flow].routes.length - 1 ? 1 : 0;
    return notCertified ? '/certify' : success ? flows[flow].routes[flows[flow].routes.indexOf(success) + next] : flows[flow].routes[0];
};

export const capitalize = (str) => str.toString().charAt(0).toUpperCase() + str.toString().slice(1);
