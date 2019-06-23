'use strict';
const request = require('supertest');
const crypto = require('crypto');
const assert = require('assert');
const app = require('../app');
const cheerio = require('cheerio');
const models = require('../models/asociateDefinition').models;
const threadRouter = require('../routes/threads');

function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $('[name=_csrf]').val();
 }

function getCookie(res, i) {
  return res.headers['set-cookie'][i]
    .split(';')[0]
}

function createUniqueName() {
  const hash = crypto.createHash('md5');
  hash.update('unique' + Date.now());
  return hash.digest('hex');
}

describe('home', () => {

  let forumCookie;
  
  it('ログイン前のリンク', (done) => {
    request(app)
      .get('/threads')
      .expect(/<a href="\/login"/)
      .expect(/<a href="\/"/)
      .expect(/<a href="\/about"/)
      .expect(200, done);
  });

  
  it('ログイン後のリンク', (done) => {

    var loginAgent = request(app);
    loginAgent
      .post('/login')
      .send({userId: 'userId', password: 'password'})
      .expect('Location', '/threads')
      .expect(302)
      .end((err, res) => {
        forumCookie = getCookie(res, 0)
        loginAgent
          .get('/threads')
          .set('Cookie', forumCookie)
          .expect(/<a href="\/logout"/)
          .expect(/<a href="\/favorites\/users\/userId"/)
          .expect(200, done);
      })
  });

  it('ログイン前はスレッドを作成できないことを確認', (done) => {

    var req = request(app)
    
    req
      .get('/threads/new')
      .expect(200)
      .end((err, res) => {
        let csrf = getCookie(res, 0);
        let csrfToken = extractCsrfToken(res);
        req
          .post('/threads/new')
          .set('Cookie', [csrf])
          .send({title: 'test title', content: 'test content', _csrf: csrfToken})
          .expect('Location', '/login?from=/threads/new')
          .expect(302, done)
      })

  })


});


describe('thread', () => {

  let title = createUniqueName();
  let content = 'test content'

  let forumCookie;
  beforeEach((done) => {
    request(app)
      .post('/login')
      .send({userId: 'userId', password: 'password'})
      .end((err, res) => {
        forumCookie = getCookie(res, 0)
        done();
      });
  });


  it('スレッド作成確認', (done) => {
    let req = request(app);
    req
      .get('/threads/new')
      .expect(200)
      .end((err, res) => {
        let csrf = getCookie(res, 0);
        let csrfToken = extractCsrfToken(res);
        req
          .post('/threads/new')
          .set('Cookie', [csrf + ';' + forumCookie])
          .send({title: title, content: content, _csrf: csrfToken})
          .expect('Location', '/')
          .expect(302)
          .end((err, res) => {
            req 
              .get('/threads')
              .expect(new RegExp(title))
              .expect(200);
            // POSTで登録したデータの確認
            models.Thread.findAll({
              where: {
                title: title
              }
            }).then(threads => {
              assert.equal(1, threads.length);
              const thread = threads[0];
              models.Post.findAll({
                where: {
                  threadId: thread.threadId
                }
              }).then(posts =>{
                assert.equal(1, posts.length);
                assert.equal(posts[0].content, content);
                threadRouter.deleteThreads(title);
              })
            })
            done();
          });
        })
  });
});


describe('posts', () => {

  let testThreadId
  before((done) => {
    models.Thread.create({
      title: createUniqueName(),
      createdBy: 'userId'
    }).then(result => {
      testThreadId = result.threadId;
      console.log('testThreadId=' + testThreadId);
      done();
    })
  });

  let forumCookie;
  beforeEach((done) => {
    request(app)
      .post('/login')
      .send({userId: 'userId', password: 'password'})
      .end((err, res) => {
        forumCookie = getCookie(res, 0)
        done();
      });
  });

  it('投稿確認', (done) => {
    let req = request(app);
    let url = `/thread/${testThreadId}/posts`
    const content = 'testr\r\ncontent'
    req
      .get(url)
      // 表示されない項目にcsrfトークンが仕込まれる場合、GET時に表示させる必要がある
      .set('Cookie', forumCookie)
      .expect(200)
      .end((err, res) => {
        const csrf = getCookie(res, 0);
        const csrfToken = extractCsrfToken(res);
        console.log(url);
        req.post(url)
          .set('Cookie', [csrf + ';' + forumCookie])
          .send({
            content: content, 
            postedBy: 'userId',
            threadId: testThreadId,
            filepath: createUniqueName(),
            _csrf: csrfToken
          }).expect('Location', url)
          .expect(302)
          .end((err, res) => {
            models.Post.findAll({
              where: { threadId: testThreadId },
              order: [['createdAt', 'ASC']]
            }).then(posts =>{
              assert.equal(1, posts.length);
              assert.equal(posts[0].content, content);
              assert.equal(posts[0].filepath, undefined);
              threadRouter.deleteThread(testThreadId);
            });
            done();
          })
      });
  });
})

