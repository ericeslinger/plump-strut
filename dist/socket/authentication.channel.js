'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function test(msg, server) {
    return server.services.tokenStore.tokenToUser(msg.key).then(function (v) {
        if (!!v) {
            msg.client.user = v;
            msg.client.join('authenticated');
            console.log('authenticated user');
            return {
                response: 'testkey',
                you: v,
                auth: true,
                token: msg.key
            };
        } else {
            return {
                response: 'testkey',
                auth: false
            };
        }
    }).then(function (response) {
        if (response.auth === true && server.extensions['loginExtras']) {
            return server.extensions['loginExtras'](response.you).then(function (r) {
                return Object.assign({}, response, { included: r });
            });
        } else {
            return response;
        }
    }).then(function (response) {
        return {
            broadcast: false,
            key: msg.responseKey,
            msg: response
        };
    });
}
function start(msg, server) {
    msg.client.join(msg.nonce);
    return {
        key: msg.nonce,
        broadcast: false,
        msg: {
            response: 'startauth',
            types: server.config.authTypes.map(function (v) {
                return {
                    name: v.name,
                    iconUrl: v.iconUrl,
                    url: '' + server.baseUrl() + server.config.authRoot + '?method=' + v.name + '&nonce=' + msg.nonce
                };
            })
        }
    };
}
var AuthenticationChannel = exports.AuthenticationChannel = {
    auth: function auth(msg, strut) {
        return Promise.resolve().then(function () {
            if (msg.request === 'startauth') {
                return start(msg, strut);
            } else if (msg.request === 'testkey') {
                return test(msg, strut);
            } else {
                return {
                    broadcast: false,
                    key: 'error',
                    msg: {
                        response: 'invalidRequest'
                    }
                };
            }
        });
    }
};