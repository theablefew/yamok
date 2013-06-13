$(document).foundation();

$(function(){
  $(document).on('submit', 'form', function(e){
    e.preventDefault();

    if($('#testName').val()) {
      var savedArr = [];
      $(this).find(':checked').each(function(){
        savedArr.push(this.getAttribute('id'));
      });
      localStorage[$('#testName').val()] = savedArr;
    }

    $('#submitJson').val('Loading...').attr('disable', 'disable');
    $.post($(this).attr('action'), $(this).serialize(), function(data){
      document.body.innerHTML = '';
      var table = document.createElement('div');
      table.setAttribute('id', 'table-data');

      var raw = document.createElement('div');
      raw.setAttribute('id', 'raw-data');

      var textarea = document.createElement('textarea');
      textarea.textContent = data.output;

      raw.appendChild(textarea);
      document.body.appendChild(table);
      document.body.appendChild(raw);

      buildTable(data.os, data.browsers, data.versions);
    }, 'json');
  });
});

$(function(){
  var a = document.createElement('a'),
      span = document.createElement('span'),
      link, wrap, remove;
  for(var store in localStorage){
    link = a.cloneNode();
    link.textContent = store;
    link.setAttribute('href', '#');
    link.setAttribute('data-storage', store);
    link.setAttribute('class', 'set-storage');

    remove = a.cloneNode();
    remove.innerHTML = '&times;';
    remove.setAttribute('href', '#');
    remove.setAttribute('data-remove', store);
    remove.setAttribute('class', 'remove-storage');

    wrap = span.cloneNode();
    wrap.setAttribute('class', 'label radius secondary');
    wrap.appendChild(link);
    wrap.appendChild(remove);

    document.getElementById('saved-storage').appendChild(wrap);
  }

  $(document).on('click', $('a.set-storage'), function(e){
    e.preventDefault();
    $('input').find(':checked').removeAttr('checked');
    $('.custom.checkbox.checked').removeClass('checked');

    var storageArray = localStorage[$(this).data('storage')].split(',');
    $('#testName').val($(this).text());
    for(var i=0; i<storageArray.length; i++){
      $('#'+storageArray[i]).attr('checked', 'checked');
      $('#'+storageArray[i]).next('.custom').addClass('checked');
    }
  });

  $(document).on('click', $('a.remove-storage'), function(e){
    e.preventDefault();
    var areYouSure = confirm('Are you sure?');
    if(areYouSure) {
      localStorage.removeItem($(this).data('remove'));
      $(this).parent().fadeOut();
    }
  });
});

$(function(){
  var div = document.createElement('div');
  var h3 = document.createElement('h3');
  var ul = document.createElement('ul');
  var li = document.createElement('li');
  var form = document.createElement('form');
  form.setAttribute('class', 'custom');
  form.setAttribute('action', '/generate');
  form.setAttribute('type', 'post');
  var label = document.createElement('label');
  var input = document.createElement('input');
  var row = '';

  _.each(osArr, function(os, idx){
    if(idx % 3 === 0) {
      row = div.cloneNode();
      row.setAttribute('class', 'row');
    }

    var column = div.cloneNode();
    column.setAttribute('class', 'large-4 columns');

    var header = h3.cloneNode();
    header.textContent = os;
    column.appendChild(header);

    var list = ul.cloneNode();
    list.setAttribute('class', 'no-bullet');

    _.each(browserObj[os]['__wrapped__'], function(browser){
      browser.api_name = browser.api_name.replace('googlechrome', 'chrome');
      var item = li.cloneNode();
      var checkbox = input.cloneNode();
      var lbl = label.cloneNode();
      var name = (os + browser.api_name + browser.short_version).toLowerCase().replace(' ', '').replace(/\./g, '');

      lbl.setAttribute('for', name);
      lbl.textContent = browser.long_name + ' ' + browser.short_version;

      checkbox.setAttribute('id', name);
      checkbox.setAttribute('value', '{"os": "' + os + '", "api_name": "' + browser.api_name + '", "long_version": "' + browser.long_version + '", "short_version": "' + browser.short_version + '"}');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('name', 'browser');
      checkbox.setAttribute('style', 'display:none;');
      // checkbox.setAttribute('checked', 'checked');

      lbl.innerHTML =  checkbox.outerHTML + '<span class="custom checkbox "></span>' + lbl.innerHTML;

      item.appendChild(lbl);
      item.setAttribute('data-api-name', browser.api_name);
      item.setAttribute('data-long-version', browser.long_version);

      list.appendChild(item);
    })

    column.appendChild(list);

    row.appendChild(column);
    form.appendChild(row);
  })

  row = div.cloneNode();
  row.setAttribute('class', 'row');

  var nameColumn = div.cloneNode();
  var nameInput = input.cloneNode();
  var nameLabel = label.cloneNode();
  nameColumn.setAttribute('class', 'large-4 large-offset-4 columns');
  nameInput.setAttribute('type', 'text');
  nameInput.setAttribute('name', 'testName');
  nameInput.setAttribute('id', 'testName');
  nameLabel.setAttribute('for', 'testName');
  nameLabel.textContent = 'Save Test as: ';
  nameColumn.appendChild(nameLabel);
  nameColumn.appendChild(nameInput);
  row.appendChild(nameColumn);

  var submitColumn = div.cloneNode();
  submitColumn.setAttribute('class', 'large-4 columns');
  var submit = input.cloneNode();
  submit.setAttribute('type', 'submit');
  submit.setAttribute('class', 'button');
  submit.setAttribute('id', 'submitJson');
  submitColumn.appendChild(submit);
  row.appendChild(submitColumn);
  form.appendChild(row);

  document.getElementById('browser-list').appendChild(form);

});

function buildTable(os, browsers, versions) {
  var table = document.createElement('table'),
      thead = document.createElement('thead'),
      tbody = document.createElement('tbody'),
      div = document.createElement('div'),
      tr = document.createElement('tr'),
      td = document.createElement('td'),
      th = document.createElement('th'),
      headContent, headRow, rowContent, bodyRows,
      allVersions = [];

  table.setAttribute('class', 'main');

  var blankSpot = th.cloneNode();
  blankSpot.setAttribute('class', 'first');
  headRow = tr.cloneNode();
  headRow.appendChild(blankSpot);

  for(var i=0; i<os.length; i++) {
    headContent = th.cloneNode();
    headContent.textContent = os[i];
    headContent.setAttribute('style', "width: " + 100/os.length + "%;");
    headRow.appendChild(headContent);
  }

  thead.appendChild(headRow);
  table.appendChild(thead);

  for(var name in browsers) {
    bodyRows = tr.cloneNode();
    rowContent = th.cloneNode();
    rowContent.textContent = browsers[name];
    bodyRows.appendChild(rowContent);

    for(var i=0; i<os.length; i++) {
      var output = '';
      var browserId = '';
      var divWrap = '';
      rowContent = td.cloneNode();
      for(var brwsr in versions[os[i]]) {
        if(brwsr === browsers[name]) {
          if(versions[os[i]][brwsr].length <= 0) {
            output = "";
          } else if(versions[os[i]][brwsr].length === 1) {
            output = versions[os[i]][brwsr][0];
            browserId = (os[i] + browsers[name] + output).toLowerCase().replace(/ /g, '').replace(/\./g, '');
            divWrap = div.cloneNode();
            divWrap.setAttribute('id', browserId);
            divWrap.innerHTML = output;
            rowContent.appendChild(divWrap);
          } else {
            for(var l=0; l<versions[os[i]][brwsr].length; l++) {
              output = versions[os[i]][brwsr][l];
              browserId = (os[i] + browsers[name] + versions[os[i]][brwsr][l]).toLowerCase().replace(/ /g, '').replace(/\./g, '');
              divWrap = div.cloneNode();
              divWrap.setAttribute('id', browserId);
              divWrap.innerHTML = output;
              rowContent.appendChild(divWrap);
            }
          }
        }
      }

      bodyRows.appendChild(rowContent);
    }

    tbody.appendChild(bodyRows);
  }

  table.appendChild(tbody);

  var output = document.getElementById('table-data');
  output.appendChild(table);
}