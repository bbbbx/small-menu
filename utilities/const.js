const BASE_URL = 'http://apis.juhe.cn/cook/query?';
const CATEGORY_URL = 'http://apis.juhe.cn/cook/index?';
const PORT = 3000;
const HOSTNAME = 'http://localhost';
const CLOUD_HOSTNAME = 'http://smallmenu.venusworld.cn';

const QINIU_DOMAIN = 'http://p6evonvn0.bkt.clouddn.com/';
const AVATAR_BOY = 'http://p6evonvn0.bkt.clouddn.com/cooker_boy.png';
const AVATAR_GIRL = 'http://p6evonvn0.bkt.clouddn.com/cooker_girl.png';

const PLEASE_LOGIN = '请先登录！';
const GENDER_ERROR = '性别有误！';
const UPDATE_SUCCESS = '更新成功';
const POST_SUCCESS = '发表成功';
const PLEASE_SELECT_FILE = '请选择文件！';

const SUCCESS_CODE = 200;
const ERROR_CODE = 404;
const SUCCESS_MESSAGE = '请求成功';
const USER_NOT_EXISTS = '用户不存在';

module.exports = {
	ERROR_CODE,
	SUCCESS_CODE,
	SUCCESS_MESSAGE,
	USER_NOT_EXISTS,
	PLEASE_SELECT_FILE,
	POST_SUCCESS,
	QINIU_DOMAIN,
	BASE_URL,
	CATEGORY_URL,
	HOSTNAME,
	PORT,
	AVATAR_BOY,
	AVATAR_GIRL,
	CLOUD_HOSTNAME,
	PLEASE_LOGIN,
	GENDER_ERROR,
	UPDATE_SUCCESS
};