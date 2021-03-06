var request = require('request');
var cheerio = require('cheerio');
var lodash = require('lodash');
var underscoreDeepExtend = require('underscore-deep-extend');
var fs = require('fs');

var file = fs.createWriteStream('biasRatings.txt');

var _ = require('lodash');
_.mixin({deepExtend: underscoreDeepExtend(_)});

var data = {};

var options = { method: 'GET',
  url: 'http://www.allsides.com/bias/bias-ratings',
  qs:
   { field_news_source_type_tid: '2',
     field_news_bias_nid: '1',
     field_featured_bias_rating_value: 'All',
     title: ''
   },
  form: {} };

['', '1', '2'].forEach(function(page) {

  var optionsPages = _.deepExtend(options, {qs: {page: page}});

  request(optionsPages, function (error, response, body) {
    if (error) throw new Error(error);

    var $ = cheerio.load(body);

    var dataObj = {title: null, rating: null, url: null};

    $('.source-title').each(function(i, element) {
      var title = element.parent.children[0].next.children[0].next.children[0].data;
      var rating = element.parent.children[2].next.children[0].next.children[0].attribs.title;

      var rating = rating.split(': ');


      var link = element.parent.children[0].next.children[0].next.children[0].parent.attribs.href;

      //we must go deeper to get the urls!!

      var pageLink = 'http://www.allsides.com/' + link;

      var options = { method: 'GET',
        url: pageLink
      };

      request(options, function (error, response, body) {
        if (error) throw new Error(error);

          var $ = cheerio.load(body);

          $('.www').each(function (i, element) {

            var url = element.attribs.href;

            var domain = url.replace(/^https?:\/\//,''); // Strip off https:// and/or http://
            domain = domain.replace(/^www\./,''); // Strip off www.
            domain = domain.split('/')[0]; // Get the domain and just the domain (not the path)

            data[domain] = {title: title, rating: rating[1], url: url};
          });

          //write to file
          fs.writeFile('../server/bias/biasrating.json', JSON.stringify(data), function (err) {
            if (err) throw new Error(error);
            console.log('Writing to file...');
          });
      });
    });
  });
})
