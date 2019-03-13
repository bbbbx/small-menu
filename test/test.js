var request = require('supertest');
var assert = require('assert');

describe('loading express', function() {
	var server = require('../app');
	
	after('All tests passed', function(done) {
		done();
		process.exit(0);
	});

	it('should response with 200 and html', function(done) {
		request(server)
			.get('/')
			.expect('Content-Type', /html/)
			.expect(200)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

	it('should response with 200 and html', function(done) {
		request(server)
			.get('/menu/0')
			.expect('Content-Type', /html/)
			.expect(200)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

	it('should response with 200 and html', function(done) {
		request(server)
			.get('/article')
			.expect('Content-Type', /html/)
			.expect(200)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

	it('should response with 200 and html', function(done) {
		request(server)
			.get('/user')
			.expect('Content-Type', /html/)
			.expect(200)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

	it('should response with 200 and html', function(done) {
		request(server)
			.get('/login')
			.expect('Content-Type', /html/)
			.expect(200)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

	it('should response with 302', function(done) {
		request(server)
			.post('/login')
			.send({
				account: 'testtest', 
				password: 'testtest', 
				captcha: 'test' 
			})
			.expect(302)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

	it('should response 404 everything else', function(done) {
		request(server)
			.get('/foo/bar')
			.expect(404)
			.end(function(err, res) {
				if (err) process.exit(1);
				done();
			});
	});

});
