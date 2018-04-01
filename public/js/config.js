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
});