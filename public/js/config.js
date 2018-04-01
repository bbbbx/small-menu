$(document).ready(function() {
	$('#comment-content').summernote({
		placeholder: '请输入你的评论内容',
		lang: 'zh-CN',
		height: 200,
		maxHeight: 400,
		toolbar: [
			// [groupName, [list of button]]
			['style', ['bold', 'italic', 'underline', 'clear']],
			['font', ['strikethrough', 'superscript', 'subscript']],
			['fontsize', ['fontsize']],
			['color', ['color']],
			['para', ['ul', 'ol', 'paragraph']]
		]
	});

	let password = document.querySelector('#password');
	let passwordConfirm = document.querySelector('#passwordConfirm');
	let form = document.querySelector('#register');
	passwordConfirm.addEventListener('change', function() {
		if (passwordConfirm.value !== password.value) {
			passwordConfirm.focus();
			swal('两次密码不一致');
		}
	});
	form.addEventListener('submit', function() {
		console.log('a');
	});
});