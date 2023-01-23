var express 				= require("express"),
	app 					= express(),
	bodyParser 				= require("body-parser"),
	mongoose 				= require("mongoose"),
	passport 				= require("passport"),
	methodOverride 			= require("method-override"),
	LocalStrategy 			= require("passport-local"),
	passportLocalMongoose 	= require("passport-local-mongoose");

var url = process.env.DATABASEURL || "mongodb+srv://Mayank:workforme@cluster0.uq1zw.mongodb.net/myprosite?retryWrites=true&w=majority";
// var url = process.env.DATABASEURLPERSONAL || "mongodb://localhost/withweb2";
mongoose.connect(url);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.locals.moment = require('moment');

// ==========user=============
app.use(require("express-session")({
	secret: "withweb",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// =========userSchema===========
var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	name: String,
	joined: { type: Date, default: Date.now },
	isAdmin: {type: Boolean, default: false}
});
UserSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", UserSchema);
// =========userSchema===========

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});
// ==========user=============

// ============feedback=================

var feedSchema = mongoose.Schema({
	name: String,
	text: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});
var Feed = mongoose.model("Feed", feedSchema);

// ============feedback=================

// =========Product===========
var productSchema = new mongoose.Schema({
	name: String,
	image: String,
	desc: String,
	url: String,
	author:{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
		name: String
	},
	createdAt: { type: Date, default: Date.now },
	pro: String
});
var Product = mongoose.model("Product", productSchema);
// =========Product===========

// =============Blog==============
var blogSchema = mongoose.Schema({
	text: String,
	title: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    blogCount: Number,
  	rateCount: Number,
  	totalVote: Number
});
var Blog = mongoose.model("Blog", blogSchema);
// =============Blog==============

app.get("/",function(req, res){
	res.redirect("index");
});

// ===========feedRoute==========
app.get("/index",function(req, res){
	User.find({},function(err, foundUser){
		if(err){
			console.log(err);
		}
		Feed.find({},function(err, all){
			if(err){
				console.log(err);
			} else {
				res.render("index",{feed:all, currentUser: req.user, user:foundUser});
			}
		});
	});
});
app.post("/index", function(req, res){
	Feed.create(req.body.data, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			res.redirect("/index"); 
		}
	});
});
app.delete("/index/:id",function(req, res){
	Feed.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/index");
		}
	});
});
// ===========feedRoute==========

// ==========productroute===============

app.get("/product",function(req, res){
	User.find({},function(err, foundUser){
		if(err){
			console.log(err);
		}
		Product.find({},function(err, all){
			if(err){
				console.log(err);
			} else {
				res.render("product",{product:all, currentUser: req.user, user:foundUser});
			}
		});
	});
});
app.post("/product",isLoggedIn, function(req, res){
	Product.create(req.body.data, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			newlyCreated.author.id = req.user._id;
      		newlyCreated.author.username = req.user.username;
      		newlyCreated.author.name = req.user.name;
      		newlyCreated.save();
			res.redirect("/product"); 
		}
	});
});
app.get("/product/:id", function(req, res){
	Product.findById(req.params.id,function(err, foundPro){
		if(err || !foundPro){
            console.log(err);
            res.redirect('back');
        }else{
			res.render("showproduct", {product: foundPro});
		}
	});
});
app.get("/product/:id/edit",isLoggedIn,function(req, res){
	Product.findById(req.params.id, function(err, foundPro){
		if(err){
			res.redirect("/product");
		}else{
			res.render("editproduct", {product: foundPro});
		}
	});
});
app.put("/product/:id",isLoggedIn,function(req, res){
	Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedPro){
		if(err){
			console.log(err);
			res.redirect("/product");
		}else{
			res.redirect("/product/" + req.params.id);
		}
	});
});
app.delete("/product/:id",isLoggedIn,function(req, res){
	Product.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			res.redirect("/product");
		}
	});
});

// ==========productroute===============

app.get("/writings",function(req, res){
	res.render("writings");
});
app.get("/innovation",function(req, res){
	res.render("innovation");
});

// =======userRoute===========
app.get("/user", function(req, res){
	res.render("user");
});

//handling user sign
app.post("/register", function(req, res){
	var newUser = new User({
      username: req.body.username,
      name: req.body.name
    });
    if(req.body.adminCode === 'workforme'){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render('user');
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/index");
		});
	});
});

app.get("/login", function(req, res){
	if (req.user) {
    	return res.redirect("/");
  	} else {
    	res.render("user");
  	}
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/user"		
}), function(req, res){
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("back");
});
// =======userRoute===========

// ============userProfile=============
// user profile
app.get("/user/:user_id", function(req, res) {
  	User.findById(req.params.user_id, function(err, foundUser) {
    	if (err || !foundUser) {
    		console.log(err);
      		return res.render("back");
    	}
    	Product.find()
      		.where("author.id")
      		.equals(foundUser._id)
      		.exec(function(err, product) {
        		if (err) {
        			console.log(err);
          			res.render("back");
        		}
            	res.render("usershow", {
              		user: foundUser,
              		product: product
            	});
          	});
  	});
});

// edit profile
app.get("/user/:user_id/edit",isLoggedIn,function(req, res) {
    res.render("useredit", {user: req.user});
});

// update profile
app.put("/user/:user_id",isLoggedIn,function(req, res) {
    User.findByIdAndUpdate(req.params.user_id,req.body.user, function(err, user) {
      	if (err) {
      		console.log(err);
      	} else {
        	res.redirect("/user/" + req.params.user_id);
      	}
    });
});

// delete user
app.delete("/user/:user_id", isLoggedIn, function(req,res) {
  	User.findByIdAndRemove(req.params.user_id, function(err) {
    	if (err) {
    		console.log(err);
      		res.redirect("/");
    	}else{
    		console.log(err);
        	res.redirect("/");
      	}
  	});
});
// ============userProfile=============

// =============blogPage============

app.get("/blog",function(req, res){
	var noMatch = '';
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		
		Blog.find({$or:[
				{text:regex},
				{author:{username:regex}}
				]}, function(err, allBlogs){
			if(err){
				console.log(err);
			} else {
				if(allBlogs.length < 1){
					noMatch = "Cannot find matching opinion, try again!";
				}else if(allBlogs.length > 0) {
          noMatch = allBlogs.length;
        }
				res.render("blog",{blog:allBlogs, noMatch:noMatch});
			}
		});
	} else if (req.query.sortby){
		if(req.query.sortby === "mostrated") {
      		Blog.find({})
      		  	.sort({
      		    	totalVote: -1
      		  	})
      		  	.exec(function(err, allBlogs) {
      		    	if (err) {
      		      		console.log(err);
      		   	 	} else {
                  allBlogs.blogCount = allBlogs.length;
      		      		res.render("blog", {
      		        		blog: allBlogs,
      		        		currentUser: req.user,
      		        		noMatch: noMatch
      		      		});
      		    	}
      		  	});
    	}else if(req.query.sortby === "new"){
			Blog.find({}).sort({createdAt:-1}).exec(function(err, allBlogs){
				if(err){
					console.log(err);
				} else {
          allBlogs.blogCount = allBlogs.length;
					res.render("blog",{blog:allBlogs, currentUser: req.user, noMatch:noMatch});
				}
			});
		}else{
			Blog.find({}).sort({totalVote:-1}).exec(function(err, allBlogs){
				if(err){
					console.log(err);
				} else {
					allBlogs.blogCount = allBlogs.length;
					res.render("blog",{blog:allBlogs,currentUser: req.user, noMatch:noMatch});
				}
			});
		}
	} else {
      	Blog.find({}).sort({totalVote:-1}).exec(function(err, allBlogs){
			if(err){
				console.log(err);
			} else {
				allBlogs.blogCount = allBlogs.length;
				res.render("blog",{blog:allBlogs,currentUser: req.user, noMatch:noMatch});
			}
		});
	}
});

app.post("/blog",isLoggedIn, function(req, res){
	Blog.create(req.body.data, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			newlyCreated.author.id = req.user._id;
      		newlyCreated.author.username = req.user.username;
      		newlyCreated.author.name = req.user.name;
      		newlyCreated.save();
			res.redirect("/blog"); 
		}
	});
});

app.get("/blog/:id", function(req, res){
	 Blog.findById(req.params.id).populate("likes").exec(function(err, foundBlog){
		if(err || !foundBlog){
            console.log(err);
            res.redirect('/blog');
        }else{
			res.render("blog", {blog: foundBlog});
		}
	});
});

// Blog Like Route
app.post("/blog/:id/like",isLoggedIn, function (req, res) {
    Blog.findById(req.params.id, function (err, foundBlog) {
        if (err) {
            console.log(err);
            return res.redirect("/blog");
        }

        // check if req.user._id exists in foundBlog.likes
        var foundUserLike = foundBlog.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundBlog.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundBlog.likes.push(req.user);
        }
        foundBlog.totalVote = foundBlog.likes.length;
        foundBlog.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/blog");
            }
            return res.redirect("/blog");
        });
    });
});

app.get("/blog/:id/edit",function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blog");
		}else{
			res.render("editblog", {blog: foundBlog});
		}
	});
});

app.put("/blog/:id",isLoggedIn,function(req, res){
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			console.log(err);
			res.redirect("/blog");
		}else{
			res.redirect("/blog");
		}
	});
});

app.delete("/blog/:id",isLoggedIn,function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("/blog");
		}else{
			res.redirect("/blog");
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
// =============blogPage============

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/user");
}

const host = "0.0.0.0";
const port = process.env.PORT || 3001;
app.listen(port,host, function() {
  console.log("Welcome Mayank!" + port);
});