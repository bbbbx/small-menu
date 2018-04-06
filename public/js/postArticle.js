var album = document.querySelector('#album');
var albumPreview = document.querySelector('#albumPreview');

var fileTypes = [
	'image/jpeg',
	'image/pjpeg',
	'image/png'
];

album.style.opacity = 0;

function validFileType(file) {
	for(var i = 0; i < fileTypes.length; i++) {
		if(file.type === fileTypes[i]) {
			return true;
		}
	}
	return false;
}

function returnFileSize(number) {
	if (number < 1024) {
		return number + 'bytes';
	} else if (number > 1024 && number < 1048576) {
		return (number/1024).toFixed(1) + 'KB';
	} else if (number > 1048576) {
		return (number/1048576).toFixed(1) + 'MB';
	}
}

function updateImageDisplay() {
	while (albumPreview.firstChild) {
		albumPreview.removeChild(albumPreview.firstChild);
	}
	
	var curFiles = album.files;
	if (curFiles.length === 0) {
		var para = document.createElement('p');
		para.innerText = '未选择文件';
		albumPreview.appendChild(para);
	} else {
		// var list = document.createElement('ol');
		// avatarPreview.appendChild(list);
		// for(var i = 0; i < curFiles.length; i++) {
		// var listItem = document.createElement('li');
		var para = document.createElement('p');
		if (curFiles[0].size > 1024 * 1024) {
			swal('文件大于 1 MB！请重新选择');
			para.textContent = '文件大于 1 MB！请重新选择';
			albumPreview.appendChild(para);
		} else if (validFileType(curFiles[0])) {
			para.textContent = curFiles[0].name + '，文件大小：' + returnFileSize(curFiles[0].size) + '。';
			var image = document.createElement('img');
			image.src = window.URL.createObjectURL(curFiles[0]);
			image.style.width = '18rem';
			
			albumPreview.appendChild(image);
			albumPreview.appendChild(para);

		} else {
			para.textContent = curFiles[0].name + '：不是一个合法的文件，请重新选择！';
			albumPreview.appendChild(para);
		}
		// list.appendChild(listItem);
		// }
	}
}

$(document).ready(function() {
	$('#content').summernote({
		placeholder: '请输入你的文章正文',
		lang: 'zh-CN',
		height: 400,
		maxHeight: 500,
		toolbar: [
			['style', ['bold', 'italic', 'underline', 'clear']],
			['font', ['strikethrough', 'superscript', 'subscript']],
			['fontsize', ['fontsize']],
			['color', ['color']],
			['para', ['ul', 'ol', 'paragraph']],
			['height', ['height']],
			['insert', ['hr', 'link', 'picture', 'table']]
		]
	});

	album.addEventListener('change', updateImageDisplay);

});