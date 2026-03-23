import { getServiceUrl } from '../api';
import RequestService from '../httpRequest';

export default {
    // 分页查询音色资源
    getVoiceCloneList(params, callback) {
        RequestService.sendRequest()
            .url(`${getServiceUrl()}/voiceClone`)
            .method('GET')
            .data(params)
            .success((res) => {
                RequestService.clearRequestTime();
                callback(res);
            })
            .networkFail((err) => {
                console.error('Lấy danh sách giọng thất bại:', err);
                RequestService.reAjaxFun(() => {
                    this.getVoiceCloneList(params, callback);
                });
            }).send();
    },

    // 上传音频文件
    uploadVoice(formData, callback) {
        RequestService.sendRequest()
            .url(`${getServiceUrl()}/voiceClone/upload`)
            .method('POST')
            .data(formData)
            .success((res) => {
                RequestService.clearRequestTime();
                callback(res);
            })
            .networkFail((err) => {
                console.error('Tải âm thanh lên thất bại:', err);
                RequestService.reAjaxFun(() => {
                    this.uploadVoice(formData, callback);
                });
            }).send();
    },

    // 更新音色名称
    updateName(params, callback) {
        RequestService.sendRequest()
            .url(`${getServiceUrl()}/voiceClone/updateName`)
            .method('POST')
            .data(params)
            .success((res) => {
                RequestService.clearRequestTime();
                callback(res);
            })
            .networkFail((err) => {
                console.error('Cập nhật tên thất bại:', err);
                RequestService.reAjaxFun(() => {
                    this.updateName(params, callback);
                });
            }).send();
    },

    // 获取音频下载ID
    getAudioId(id, callback) {
        RequestService.sendRequest()
            .url(`${getServiceUrl()}/voiceClone/audio/${id}`)
            .method('POST')
            .success((res) => {
                RequestService.clearRequestTime();
                callback(res);
            })
            .networkFail((err) => {
                console.error('Lấy ID âm thanh thất bại:', err);
                RequestService.reAjaxFun(() => {
                    this.getAudioId(id, callback);
                });
            }).send();
    },

    // 获取音频播放URL
    getPlayVoiceUrl(uuid) {
        return `${getServiceUrl()}/voiceClone/play/${uuid}`;
    },

    // 复刻音频
    cloneAudio(params, callback, errorCallback) {
        RequestService.sendRequest()
            .url(`${getServiceUrl()}/voiceClone/cloneAudio`)
            .method('POST')
            .data(params)
            .success((res) => {
                RequestService.clearRequestTime();
                callback(res);
            })
            .fail((res) => {
                // 业务失败回调
                RequestService.clearRequestTime();
                if (errorCallback) {
                    errorCallback(res);
                } else {
                    callback(res);
                }
            })
            .networkFail((err) => {
                console.error('Tải lên thất bại:', err);
                RequestService.reAjaxFun(() => {
                    this.cloneAudio(params, callback, errorCallback);
                });
            }).send();
    }
}
