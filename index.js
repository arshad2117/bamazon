var express    = require("express");
var mysql      = require('mysql');
var bodyParser = require('body-parser');
 var connection = mysql.createConnection({
   host     : 'arshad.cfsoole1sfph.us-east-1.rds.amazonaws.com',
	 port: '3306',
   user     : 'arshad',
   password : 'arshad1919',
   database : 'miniproject'
 });
 var app = express();
 app.set('view engine', 'ejs');
 var ph = "";
 var st = [];
var urlencodeParser = bodyParser.urlencoded({extended: false} );


 app.get("/",function(req,res){
 	res.sendfile('fends/front.html');
 });

 app.post("/main",urlencodeParser,function(req,res){
 	ph = res.ph;
 	res.sendfile('fends/main.html');
 });

 app.get('/menu',function(req,res){
 	res.sendfile('fends/menu.html');
 });

app.get('/login',function(req,res){
	res.sendfile('fends/login.html');
});

app.get('/admin',function(req,res){
	res.sendfile('fends/admin.html');
})

app.get('/addbook',function(req,res){
	res.sendfile('fends/addbook.html');
});

app.get('/updateinv',function(req,res){
	res.sendfile('fends/updinv.html');
});

app.get('/delbook',function(req,res){
	res.sendfile('fends/delbook.html');
});

app.get('/corder',function(req,res){
  res.sendfile('fends/phone2.html');
})

app.get('/dorder',function(req,res){
  res.sendfile('fends/delorder.html');
});

app.get('/epho',function(req,res){
	res.sendfile('fends/phone.html');
});

app.post('/showbooks',urlencodeParser,function(req,res){
	var bod = req.body;
	ph = bod.ph;
	var quer = "SELECT COUNT(*) FROM Customer WHERE Contact_no = " + bod.ph +";";
	console.log(quer);
	connection.query(quer,function(error,result,fields){
		console.log(error);
		var exists = (result[0]['COUNT(*)']);
		if(exists == 0){
			var q = "INSERT INTO Customer VALUES(" + bod.ph +",'" + bod.cname + "');";
			connection.query(q,function(e,r,f){
				console.log(e);
			});
		}
	});
	res.sendfile('fends/main.html');
});

app.post('/addp',urlencodeParser,function(req,res){
	var bod = req.body;
	var w = "SELECT COUNT(*) FROM BookInfo WHERE  ISBN = "+bod.isbn+";";
	var q = "INSERT INTO BookInfo (ISBN,title,Author,YrPub,Publisher) VALUES(" + bod.isbn + ",'" + bod.title + "','" + bod.author + "'," + bod.when + ",'" + bod.publisher + "');" 
	var rt = "INSERT INTO Inventory VALUES(" + bod.sid + "," + bod.isbn + "," + bod.price + "," + bod.quantity + ");"
	console.log(w);
	console.log(q);
	console.log(rt);
	connection.query(w,function(e,r,f){
		console.log(r[0]['COUNT(*)']);
		if(r[0]['COUNT(*)'] != 0){
			console.log("SDD");
			connection.query(rt,function(e1,r1,f1){
				if(!e1){
					res.sendfile('fends/adds.html');
				}
				else {
					res.send(e1);
				}
			});	
			return;
		}
		else{
			console.log("HERE\n");
			connection.query(q,function(error,results,fields){
			if(!error){
				connection.query(rt,function(e,r,f){
					if(!e){
						res.sendfile('fends/adds.html');
					}
					else {
						res.send(e);
					}
				});	
			}	
			else{
				res.send(error);
			}
	});
		}
	});
  
});

app.post('/updp',urlencodeParser,function(req,res){
	var bod = req.body;
	var qu = "UPDATE Inventory SET quantity = " + bod.quantity + " WHERE ISBN IN (SELECT ISBN FROM BookInfo WHERE title = '" + bod.title +"')" + " AND sid = " + bod.sid + ";";
	connection.query(qu,function(error,result,fields){
		console.log(qu);
		console.log(error);
		if(!error){
			res.sendfile('fends/upds.html');
		}
		else{
			res.send(error);
		}
	});
	console.log(bod);
	//perform query over here
	
});

app.post('/delp',urlencodeParser,function(req,res){
	var bod = req.body;
	console.log("HELLO\n");
	var qu = "DELETE FROM Inventory Where ISBN = " + bod.isbn + " AND Sid = " + bod.supp + ";";
	console.log(qu);
	connection.query(qu,function(error,result,fields){
		console.log(error);
		if(!error){
			res.sendfile('fends/dels.html');
		}
		else{
			res.send(error);
		}
	});
	//perform query over here

});

app.post('/search',urlencodeParser,function(req,res){
	var bod = req.body;
	console.log(bod);
	var qu = "SELECT title,BookInfo.ISBN,sid,price FROM BookInfo,Inventory WHERE BookInfo.ISBN = Inventory.ISBN AND quantity > 0 AND ";
	var att = "";
	if(bod.title !== "")att += "title = '" + bod.title +"' AND ";
	if(bod.author !== "")att += "Author = '" + bod.author +"' AND ";
	if(bod.publisher !== "")att += "Publisher = '" + bod.publisher + "' AND ";
	att = att.substring(0,att.length-4) + " ORDER BY price;";
	console.log(qu + att);
	connection.query(qu + att,function(error,result,fields){
		st = result;
		console.log(error);
		console.log(result);
		if(!error){
			 res.render('disbooks'	,{data: result});
		}
		else{
			res.send(error);
		}
	}); 
});

app.post('/buybook',urlencodeParser,function(req,res){
	var bod = req.body;
	var isb,sid;
	console.log(st);
	console.log("HERsE\n");
	console.log(bod.title[bod.title.length - 1]);
	st.forEach(function(item){
		if(item.title === bod.title.substring(0,item.title.length) && item.sid == bod.title[bod.title.length - 1]){
			isb = item.ISBN;
			sid = item.sid;
			console.log("MATCH");
		}
	});
	console.log(st);
	console.log(ph);
	var quer = "INSERT INTO Purchase VALUES("+Math.ceil(Math.random()*1000000)+","+ph+","+isb+ ","+sid + ",1);"
	console.log(quer);
	connection.query(quer,function(e,r,f){
		if(!e){
			res.sendfile('fends/pus.html');
		}
		else{
			res.send(e);
		}
	});
});

app.post('/getbought',urlencodeParser,function(req,res){
	var bod = req.body;
	var quer = "SELECT Purchase.ISBN,sid,title FROM Purchase,BookInfo WHERE Purchase.ISBN = BookInfo.ISBN AND Contact_no=" + bod.ph + ";";
	console.log(quer);
	ph = bod.ph;
	connection.query(quer,function(e,r,f){
		if(!e){
			st = r;
			res.render('cancel',{data: r});
		}
		else{
			res.send(e);
		}
	});
});

app.post('/rembook',urlencodeParser,function(req,res){
	var bod = req.body;
	var isb,sd;
	console.log("SDFS");
	console.log(bod.title[bod.title.length -1]);
	console.log(st[0].sid);
	st.forEach(function(item){
		if(item.title === bod.title.substring(0,item.title.length) && item.sid == bod.title[bod.title.length - 1]){
			isb = item['ISBN'];
			sd = item['sid'];
		}
	});
	var quer = "DELETE FROM Purchase WHERE Contact_no=" +ph+" AND ISBN = "+isb + " AND SID = " + sd + ";";
	console.log(quer);
	connection.query(quer,function(e,r,f){
		if(!e){
			res.sendfile('fends/ord.html');
		}
		else{
			res.send(e);
		}
	});	
});

app.get('/trending',function(req,res){
	var quer = 'SELECT Author,Title FROM BookInfo WHERE ratings > (SELECT AVG(ratings) from BookInfo) and ISBN IN (SELECT ISBN FROM log_pur_details WHERE FLAG = "Purchased" GROUP BY ISBN HAVING COUNT(*) >(SELECT AVG(sales_count_all_books) FROM (SELECT COUNT(*) as sales_count_all_books FROM log_pur_details WHERE FLAG = "Purchased" GROUP BY ISBN) as t));';
	console.log(quer);
	connection.query(quer,function(e,r,f){
		if(!e){
			console.log(r);
			res.render('trending',{data: r});
		}
		else{
			res.send(e);
		}
	});
});
 
app.get('/popwomen',function(req,res){
	var quer = 'select Author,Gender FROM Autdet where Gender = "female" and Author IN (SELECT BookInfo.Author FROM BookInfo,Autdet WHERE BookInfo.Author = Autdet.Author and ratings IN (SELECT MAX(ratings) FROM BookInfo WHERE Author IN (SELECT Author FROM Autdet)));';	
	console.log(quer);
	connection.query(quer,function(e,r,f){
		if(!e){
			res.render('topauth',{data: r});
		}
		else{
			res.send(e);
		}
	});
});

app.get('/oldwomen',function(req,res){
	var quer = 'select Author from Autdet where Gender="Female"and age BETWEEN 20 and 50 and  Author IN (SELECT Author FROM BookInfo WHERE ratings > 5 and ISBN IN (SELECT ISBN FROM log_pur_details WHERE FLAG = "Purchased" GROUP BY ISBN HAVING COUNT(*) > (SELECT AVG(sales_count_all_books) FROM (SELECT COUNT(*) as sales_count_all_books FROM log_pur_details WHERE FLAG = "Purchased" GROUP BY ISBN) as t)));';	
	console.log(quer);
	connection.query(quer,function(e,r,f){
		if(!e){
			res.render('oldauth',{data: r});
		}
		else{
			res.send(e);
		}
	});
});

app.get('/splq',function(req,res){
	res.sendfile('fends/twoq.html');
});

 connection.connect(function(err){
 if(!err) {
     console.log("Database is connected ... \n\n");  
 } else {
     console.log(err);
 }
 });

 app.listen(3000);
