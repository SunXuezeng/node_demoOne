// 引入需要的模块
var express = require('express'),
	router = express.Router(),
	crypto = require('crypto'),
	User = require('../models/user.js');

router.get("/reg", function (req, res) {
	res.render('reg', {showTitle: "123132"});
});
// router.get("/index", function (req, res) {
// 	res.render('index',{aa: "123132"});

// });
router.get("/", function (req, res) {


	res.render('index',{aa: "123132"});

});

router.post("/reg",checkNotLogin);
router.post("/reg",function(req,res) {
	if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', '两次输入的口令不一致');
		return res.redirect('/reg');
	}
	console.log(req.body['password'])

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password,
	});

	User.getUserByName(req.body.username,function(err, result){
		console.dir(result);
		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}
		//console.dir(result.length);
		if(result){
			req.flash('error', '名称已经存在!!!');
			res.redirect('/reg');
		}
		else{
			User.addUser(newUser,function(err, data){

				req.session.user = newUser;
				req.flash('success','注册成功!');
				res.redirect('/index');
			})

		}

	});


});
router.get("/login",checkNotLogin);
router.get("/login", function (req, res) {
	res.render('login');
});
router.post("/login",checkNotLogin);
router.post("/login",function(req,res) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.getUserByName(req.body.username,function(err, result){
		console.dir(result);
		if (!result) {
			req.flash('error', '用户不存在');
			return res.send('用户不存在!');
		}
		if (result.password != password) {
			req.flash('error', '用户口令错误');
			return res.redirect('/login');
		}
		req.session.user = result;
		req.flash('success', '登入成功');
		res.redirect('/');
	});
});
router.get("/logout",checkLogin);
router.get("/logout",function(req,res) {
	console.dir(req.session.user);
	req.session.user=null;
	res.send('登出成功！！！');
});
function checkLogin(req, res, next) {
	if (!req.session.user) {
		return res.redirect('/login');
	}
	next();
}
function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登入');
		return res.redirect('/index');
	}
	next();
}

module.exports = router;
