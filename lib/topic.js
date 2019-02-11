var db = require("./db").db
var template = require('./template')
var qs = require('querystring');
var url = require('url');

module.exports = {
    home: (request, response) => {
        db.query('select * from topic', (err, topics) => {
            var title = 'Welcome';
            var description = 'Hello, Node.js';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<h2>${title}</h2>${description}`,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        })
    },
    page: (request, response) => {
        var _url = request.url;
        var queryData = url.parse(_url, true).query;

        db.query('select * from topic', (err, topics) => {
            if (err) throw err
            db.query(`select * from topic left join author on topic.author_id = author.id where topic.id =?`, [queryData.id], (err2, topic) => {
                if (err2) throw err2

                var title = topic[0].title
                var description = topic[0].description
                var list = template.list(topics);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description} <p>${topic[0].name}</p>`,
                    `<a href="/create">create</a>
                <a href="/update?id=${queryData.id}">update</a>
                  <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                  </form>`
                );
                response.writeHead(200);
                response.end(html);
            })
        })
    },
    create: (request, response) => {
        db.query('select * from topic', (err, topics) => {
            if (err) throw err
            db.query('select * from author', (err2, authors) => {
                if (err2) throw err2

                var title = 'Create';
                var list = template.list(topics);
                var html = template.HTML(title, list,
                    `<form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                  <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                  ${template.authorSelect(authors)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            })
        })
    },
    create_process: (request, response) => {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query(`
          insert into topic (title, description, created, author_id) values(?, ?, now(), ?)`,
                [post.title, post.description, post.author],
                (err, result) => {
                    if (err) throw err
                    response.writeHead(302, {
                        Location: `/?id=${result.insertId}`
                    })
                    response.end()
                })
        });
    },
    update: (request, response) => {
        var _url = request.url;
        var queryData = url.parse(_url, true).query;

        db.query('select * from topic', (err, topics) => {
            if (err) throw err
            db.query('select * from topic where id = ?', [queryData.id], (err2, topic) => {
                if (err2) throw err2
                db.query('select * from author', (err, authors) => {
                    var list = template.list(topics);
                    var html = template.HTML(topic[0].title, list,
                        `
                    <form action="/update_process" method="post">
                      <input type="hidden" name="id" value="${topic[0].id}">
                      <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                      <p>
                        <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                      </p>
                      <p>
                        ${template.authorSelect(authors, topic[0].author_id)}
                      </p>
                      <p>
                        <input type="submit">
                      </p>
                    </form>
                    `,
                        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                    );
                    response.writeHead(200);
                    response.end(html);
                })
            })
        })
    },
    update_process: (request, response) => {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query('update topic set title=?, description=?, author_id=? where id=?', [post.title, post.description, post.author, post.id], (err, result) => {
                if (err) throw err
                response.writeHead(302, {
                    Location: `/?id=${post.id}`
                });
                response.end();
            })
        });
    },
    delete_process: (request, response) => {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query('delete from topic where id = ?', [post.id], (err, result) => {
                if (err) {
                    throw err
                }
                response.writeHead(302, {
                    Location: '/'
                });
                response.end()
            })
        });
    }
}