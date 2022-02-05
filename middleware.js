module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','Not logged in!');
        return res.redirect('/login');
    }
    next();
}