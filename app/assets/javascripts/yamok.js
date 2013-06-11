$(document).foundation();

$(function(){
  $(document).on('submit', 'form', function(e){
    e.preventDefault();

    if($('#testName').val()) {
      var savedArr = [];
      $(this).find(':checked').each(function(){
        console.log(this.getAttribute('id'));
        savedArr.push(this.getAttribute('id'));
      });
      localStorage[$('#testName').val()] = savedArr;
    }

    $('#submitJson').val('Loading...').attr('disable', 'disable');
    $.post($(this).attr('action'), $(this).serialize(), function(data){
      document.write(data);
    });
  });
});

$(function(){
  var a = document.createElement('a'), link;
  for(var store in localStorage){
    link = a.cloneNode();
    link.textContent = store;
    link.setAttribute('href', '#');
    link.setAttribute('class', 'label radius secondary');
    link.setAttribute('data-storage', store);
    $('#saved-storage').append(link);
  }

  $(document).on('click', $('#saved-storage a'), function(e){
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

    _.each(browserObj[os]['_wrapped'], function(browser){
      var item = li.cloneNode();
      var checkbox = input.cloneNode();
      var lbl = label.cloneNode();
      var name = (os + browser.api_name + browser.short_version).toLowerCase().replace(' ', '').replace('.', '');

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
