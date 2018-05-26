function makeTable(obj_for_table, counter = 1){
    var table_html = jQuery.parseHTML( `<table class = "json_table" counter-id = ${counter} id = "json_table_${counter}"></table>` );
    var i= 0;
    var header_names = {};
    var local_counter = counter;
    var td_attr;
    $.each(obj_for_table, function(level1_k, level1_v){
        $.each(level1_v, function(k, v){
            if(jQuery.type(v) == 'object'){
                value = makeTable( JSON.parse(  "[" + JSON.stringify(v) + "]" ), counter+1 );
                counter++;
                td_attr = 'obj';
            }
            else if(jQuery.type(v) == 'array'){
                value = makeTable( v, counter+1 );
                counter++;
                td_attr = 'array';
            }
            else
            {
                value = "<div contenteditable=true>" + v + "</div>";
                td_attr = 'value';
            }
            if(typeof(header_names[k]) == "undefined" ){
                header_names[k] = i;
                insertColumn(table_html, k, local_counter);
                i++;
            }
            var cell = $(table_html).find('tr').last().find('td').eq(header_names[k]);
            $(cell).attr('td_attr',td_attr);
            $(cell).html(value);  
        });

            td_list = '<td><div contenteditable=true></div></td>'.repeat(i);
            $(table_html).append( `<tr counter-id = ${local_counter}>' ${td_list} '</tr>`);
    });
    $(table_html).find('tr').last().remove();
    return table_html;
}   


function insertColumn(table_ref, header_name, counter) {
    if( !$(table_ref).find('tr').first().length ){
        var thead = `<thead  counter-id = ${counter} id = "json_table_header_${counter}"><tr counter-id = ${counter}><th> ${header_name} </th></tr></thead>`;
        var tbody = `<tbody  counter-id = ${counter} id = "json_table_body_${counter}"><tr counter-id = ${counter}><td><div contenteditable=true></div></td></tr></tbody>`
        $(table_ref).append(thead);
        $(table_ref).append(tbody);
    }
    else
    {
        $(table_ref).find('tr').each(function(){
            $(this).append('<td><div contenteditable=true></div></td>');
        })
    }
    var inserted_td = $(table_ref).find('tr').first().find('td').last();
    $(inserted_td).html(header_name);
    $(inserted_td).replaceWith("<th>" + $(inserted_td).html() + "</th>");
}

function makeJson(counter=1){
    var header = [];
    var data = [];
    $('#json_table_header_'+ counter + ' th').each(function(i, v){
        header[i] = $(this).text();
    });
    var row_finder = `#json_table_body_${counter} tr[counter-id=${counter}]`;
    $(row_finder).each(function(row_i, row_v){
        var obj = {};
        $(header).each(function(header_i, header_value){
            var cell = $(row_v).children('td').eq(header_i);
            var td_attr = $(cell).attr('td_attr');
            var inner_text = $(cell).children('div').text();
            var inner_table = $(cell).find('table');
            switch(td_attr){
                case 'value':
                obj[header_value] = inner_text;
                break;
                case 'obj':
                case 'array':
                obj[header_value] = makeJson( $(inner_table).attr('counter-id') );
                break;
                case null:
                case '':
                case undefined:
                break;
                default:
                obj[header_value] = "unknown value";
                break;
            }
        });
        data.push(obj);
    });
    return data;
}

