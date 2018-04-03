var avatarInput = document.querySelector('#avatar');
var avatarPreview = document.querySelector('#avatarPreview');

var fileTypes = [
	'image/jpeg',
	'image/pjpeg',
	'image/png'
];

avatarInput.style.opacity = 0;

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
	while (avatarPreview.firstChild) {
		avatarPreview.removeChild(avatarPreview.firstChild);
	}
	
	var curFiles = avatarInput.files;
	if (curFiles.length === 0) {
		var para = document.createElement('p');
		para.innerText = '未选择文件';
		avatarPreview.appendChild(para);
	} else {
		// var list = document.createElement('ol');
		// avatarPreview.appendChild(list);
		// for(var i = 0; i < curFiles.length; i++) {
		// var listItem = document.createElement('li');
		var para = document.createElement('p');
		if(validFileType(curFiles[0])) {
			para.textContent = '文件名 ' + curFiles[0].name + '；文件大小 ' + returnFileSize(curFiles[0].size) + '。';
			var image = document.createElement('img');
			image.src = window.URL.createObjectURL(curFiles[0]);
			
			console.log(curFiles[0]);
			console.log(image.src);
			avatarPreview.appendChild(image);
			avatarPreview.appendChild(para);

		} else {
			para.textContent = '文件名 ' + curFiles[0].name + '：不是一个合法的文件，请重新选择！';
			avatarPreview.appendChild(para);
		}
		// list.appendChild(listItem);
		// }
	}
}

avatarInput.addEventListener('change', updateImageDisplay);