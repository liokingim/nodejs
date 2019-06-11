var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var template = require('./lib/template.js');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', 'utf-8', (err, filelist) => {
                var title = 'Welcome';
                var description = "Hello. Node.js";
                var list = template.list(filelist);
                var html = template.html(title, list, `<h2>${title}</h2>
                  <p>${description}</p>`, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            })
        } else {
            fs.readdir('./data', 'utf-8', (err, filelist) => {
                var filtered = path.parse(queryData.id).base;
                fs.readFile(`data/${queryData.id}`, 'utf-8', (err, data) => {
                    var title = queryData.id;
                    var description = data;
                    var list = template.list(filelist);
                    var html = template.html(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>
                        <form action="/delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                        </form>`);
                    response.writeHead(200);
                    response.end(html);
                });
            })
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', 'utf-8', (err, filelist) => {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list, `
<form action="/create_process" method="post">
  <p><input type="text" name="title" placeholder="title"></p>
  <p>
    <textarea name="description" placeholder="description"></textarea>
  </p>
  <p>
    <input type="submit">
  </p>
</form>`, '');
            response.writeHead(200);
            response.end(html);
        })
    } else if (pathname === '/create_process') {
        var body = "";

        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end('success');
            });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data', 'utf-8', (err, filelist) => {
            var filtered = path.parse(queryData.id).base;
            fs.readFile(`data/${filtered}`, 'utf-8', (err, description) => {
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(title, list, `
<form action="/update_process" method="post">
<input type="hidden" name="id" value="${title}">
  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
  <p>
    <textarea name="description" placeholder="description">${description}</textarea>
  </p>
  <p>
    <input type="submit">
  </p>
</form>
                    `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                response.writeHead(200);
                response.end(html);
            });
        })
    } else if (pathname === '/update_process') {
        var body = "";

        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            var filtered = path.parse(id).base;
            fs.rename(`data/${filtered}`, `data/${title}`, (err) => {
                fs.writeFile(`data/${title}`, description, 'utf8', (err) => {
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            })
        });
    } else if (pathname === '/delete_process') {
        var body = "";

        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var filtered = path.parse(id).base;
            fs.unlink(`data/${filtered}`, (err) => {
                response.writeHead(302, {Location: `/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end(`Not found`);
    }
});
app.listen(3000);