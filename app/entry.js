'use strict';
const $ = require('jquery');
const global = Function('return this;')();
global.jQuery = $;
const bootstrap = require('bootstrap');



$('.favorite-button').each((i, e) => {
    const button = $(e);
    button.click(() => {
      
      const postId = button.data('postId');
      const userId = button.data('userId');
      const isRegister = e.className.indexOf('btn-default') >= 0;


    　if (isRegister) {
        $.post(`/favorites/users/${userId}/posts/${postId}/resister`, {},
        (data) => {
            button.removeClass('btn-default');
            button.addClass('btn-success');
        });
     
      } else {
        $.post(`/favorites/users/${userId}/posts/${postId}/cancel`, {},
        (data) => {
            button.removeClass('btn-success');
            button.addClass('btn-default');
        });

      }
    });
         
});
