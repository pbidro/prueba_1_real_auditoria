$(function(){
  // make icons draggable if jQuery UI is loaded
  if($.fn.draggable){
    $(".icon").draggable({containment:'#desktop'});
  }

  let z=1000;
    function createWindow(id,title,content){
      if($("#"+id).length){ $("#"+id).show().css('z-index',z++); return; }
      const win=$("<div class='window fixed inset-x-0 top-8 bottom-12 bg-white rounded shadow-lg flex flex-col'></div>");
      win.attr('id',id).css('z-index',z++);
      const header=$("<div class='window-header bg-gray-200 flex items-center px-2 py-1'><div class='flex space-x-1'><span class='circle close'></span><span class='circle min'></span><span class='circle max'></span></div><div class='flex-1 text-center drag-handle font-semibold'>"+title+"</div></div>");
      const body=$("<div class='flex-1 overflow-auto p-0'></div>").append(content);
      win.append(header).append(body);
      header.find('.close').on('click',()=>win.hide());
      header.find('.min').on('click',()=>win.hide());
      header.find('.max').on('click',function(){
        const desktop=$('#desktop');
        const navH=$('#navbar').outerHeight()||0;
        const dockH=$('#dock').outerHeight()||0;
        if(win.data('max')){
          const prev=win.data('prev');
          win.css(prev).data('max',false);
          if($.fn.draggable) win.draggable('enable');
          if($.fn.resizable) win.resizable('enable');
        }else{
          win.data('prev',{top:win.css('top'),left:win.css('left'),width:win.width(),height:win.height()});
          win.css({top:navH,left:0,width:desktop.width(),height:desktop.height()-navH-dockH}).data('max',true);
          if($.fn.draggable) win.draggable('disable');
          if($.fn.resizable) win.resizable('disable');
        }
      });
      $('#windows').append(win);
      if($.fn.draggable){
        win.draggable({handle:'.window-header',cancel:'.circle'});
      }
      if($.fn.resizable){
        win.resizable({handles:'all',containment:'#desktop'});
      }
      // start maximized for better visibility
      header.find('.max').trigger('click');
    }

  function setSelected(el){
    $('.selected').removeClass('selected');
    el.addClass('selected');
  }

  // icon open handlers
  $('.icon, .dock-icon').on('dblclick',function(){
    const app=$(this).data('app');
    setSelected($(this));
    openApp(app);
  });

  // open via context menu (right click)
  $(document).on('contextmenu','.icon, .dock-icon',function(e){
    e.preventDefault();
    $('#contextMenu').remove();
    const app=$(this).data('app');
    const menu=$('<ul id="contextMenu" class="absolute bg-white border rounded shadow text-sm"></ul>');
    menu.append('<li class="px-2 py-1 hover:bg-gray-200 cursor-pointer">Abrir</li>');
    menu.css({top:e.pageY,left:e.pageX,'z-index':z++});
    $('body').append(menu);
    menu.on('click','li',function(){
      setSelected($(e.currentTarget));
      openApp(app);
      menu.remove();
    });
  });

  $(document).on('click',function(){
    $('#contextMenu').remove();
  });

  function openApp(app){
    switch(app){
      case 'db':
        databaseApp();break;
      case 'mail':
        mailApp();break;
      case 'graph':
        graphApp();break;
      case 'pdf':
        pdfApp();break;
      case 'notes':
        createWindow('notes','Notas','<textarea class="w-full h-64 border"></textarea><div class="text-right text-xs mt-2">Licencia gratuita terminada</div>');
        break;
      case 'calc':
        createWindow('calc','Calculadora','<input type="text" id="calcDisplay" class="border w-full mb-2" readonly><div id="calcButtons" class="grid grid-cols-4 gap-1"></div>');
        for(let n of ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+']){
          $("#calcButtons").append('<button class="bg-gray-200 p-2">'+n+'</button>');
        }
        let expr='';
        $('#calcButtons button').on('click',function(){
          const v=$(this).text();
          if(v=='='){ try{ expr=eval(expr).toString(); }catch(e){ expr='Err'; } }
          else expr+=v;
          $('#calcDisplay').val(expr);
        });
        break;
      case 'files':
        createWindow('files','Explorador','<p>Archivos de ejemplo.</p>');break;
      case 'media':
        createWindow('media','Media','<video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" class="w-full"></video>');break;
      case 'terminal':
        createWindow('terminal','Terminal','<p class="font-mono">$ echo Hola</p>');break;
      case 'map':
        mapApp();break;
      case 'safari':
        createWindow('safari','Navegador','<p>Navegador simple.</p>');break;
      case 'settings':
        createWindow('settings','Ajustes','<p>Ajustes del sistema.</p>');break;
      case 'store':
        createWindow('store','Tienda','<p>Aplicaciones disponibles.</p>');break;
      case 'sales':
        salesApp();break;
      case 'procs':
        processApp();break;
      case 'trash':
        createWindow('trash','Basurero','<p>Vacío</p>');break;
    }
  }

  /* Database Viewer */
  function databaseApp(){
    if($('#db').length){ $('#db').show(); return; }
    const tree=$('<ul class="space-y-1"></ul>');
    const datasets=[
      {name:'Datos personales',tables:['personales']},
      {name:'Datos de la compañía',tables:['boletas']},
      {name:'Catálogo de productos',tables:['catalogo']},
      {name:'Enemigos',tables:['enemigos']},
      {name:'Viajes',tables:['viajes']}
    ];
    for(let ds of datasets){
      const li=$('<li class="ml-2">📁 '+ds.name+'</li>');
      const ul=$('<ul></ul>');
      for(let t of ds.tables){
        const ti=$('<li class="ml-6 text-blue-600 cursor-pointer">📄 '+t+'</li>');
        ti.on('click',()=>openTable(t));
        ul.append(ti);
      }
      li.append(ul);
      tree.append(li);
    }
    const wrapper=$('<div class="p-2 overflow-auto h-full"></div>').append(tree);
    createWindow('db','Bases de Datos',wrapper);
  }

  function sampleData(){
    // generate data once
    if(window.sample) return window.sample;
    function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
    const names=['Ana','Luis','Pedro','Maria','Juan','Carla','Diego','Sofía','Rafael','Laura','Tomás','Camila'];
    const ap=['Gomez','Perez','Soto','Rojas','Torres','Muñoz'];
    const religions=['Católica','Atea','Judía','Musulmana','Agnóstica'];
    let personales=[];
    for(let i=0;i<50;i++){
      let sueldo=1000+i*10;
      if(i===20) sueldo=99999;
      personales.push({Nombre:rand(names)+' '+rand(ap),RUT:i+'-K',Direccion:'Calle '+(100+i),Religion:rand(religions),Sueldo:sueldo,Estado:i%2==0?'Soltero':'Casado'});
    }
    let boletas=[];for(let i=0;i<50;i++){boletas.push({Boleta:i+1,Producto:'Prod'+i,Precio:Math.floor(Math.random()*120)});}
    let catalogo=[];for(let i=0;i<50;i++){catalogo.push({Codigo:'P'+i,Especificacion:'Tecnica '+i,Stock:i===10?0:Math.floor(Math.random()*20)+1});}
    let enemigos=[];for(let i=0;i<50;i++)enemigos.push({ID:i,Descripcion:'Enemy '+i,Nivel:i%10,Ubicacion:'Lugar '+i});
    let viajes=[];for(let i=0;i<50;i++){let dur=i===10?50:i+1;viajes.push({RUT:i+'-K',Origen:'Ciudad'+i,Destino:'Destino'+i,Fecha:'2025-01-'+((i%30)+1),Duracion:dur+'h'});}    
    window.sample={personales,boletas,catalogo,enemigos,viajes};
    return window.sample;
  }

  function openTable(name){
    const data=sampleData();
    const rows=data[name];
    const columns=Object.keys(rows[0]);
    const table=$('<table class="display"></table>');
    const thead=$('<thead><tr></tr></thead>');
    columns.forEach(c=>thead.find('tr').append('<th>'+c+'</th>'));
    const tbody=$('<tbody></tbody>');
    rows.forEach(r=>{
      const tr=$('<tr></tr>');
      columns.forEach(c=>tr.append('<td>'+r[c]+'</td>'));
      tbody.append(tr);
    });
    table.append(thead);table.append(tbody);
    createWindow('table_'+name,name,table);
    table.DataTable();
  }

  /* Mail Client */
  function mailApp(){
    if($('#mail').length){ $('#mail').show(); return; }
    const mails=[
      {id:1,subject:'Irregularidad en servidor',body:'El servidor X en el piso 2 no tenía aire acondicionado — ver programa 3'},
      {id:2,subject:'Baño ocupado',body:'Encontramos un servidor en un baño — ver grafo'},
      {id:3,subject:'Sueldo extraño',body:'Revisar base Datos personales, fila 20'},
      {id:4,subject:'Producto sin stock',body:'Consulta catálogo de productos código P10'},
      {id:5,subject:'Viaje sospechoso',body:'El viaje de RUT 10-K a Destino10 dura 50h'},
      {id:6,subject:'Política de correo',body:'No usar correos personales'},
      {id:7,subject:'Actualización de seguridad',body:'Revisar enemigos con nivel > 5'},
      {id:8,subject:'Presupuesto',body:'Boletas mayores a 80 ver datos compañía'},
      {id:9,subject:'Scrum',body:'La empresa no usa Scrum, revisa PDF'},
      {id:10,subject:'Mapa',body:'Ver ubicación oficina en programa mapa'}
    ];
    const container=$('<div class="flex h-full"></div>');
    const list=$('<ul class="w-1/3 border-r overflow-auto"></ul>');
    const view=$('<div class="w-2/3 p-2 overflow-auto"></div>');
    mails.forEach(m=>list.append('<li class="p-2 cursor-pointer hover:bg-gray-200" data-id="'+m.id+'">'+m.subject+'</li>'));
    list.on('click','li',function(){
      const id=$(this).data('id');
      const m=mails.find(x=>x.id==id);
      view.html('<h3 class="font-bold">'+m.subject+'</h3><p>'+m.body+'</p>');
    });
    container.append(list,view);
    createWindow('mail','Correo',container);
  }

  /* Grafo */
  function graphApp(){
    if($('#graph').length){ $('#graph').show(); return; }
    const container=$('<div class="w-full h-full flex flex-col"><div class="p-1 text-right space-x-1"><button id="zin" class="bg-gray-200 px-2">+</button><button id="zout" class="bg-gray-200 px-2">-</button></div><div id="diagram" class="flex-1"></div></div>');
    createWindow('graph','Grafo',container);
    const $ = go.GraphObject.make;
    const diagram=$(go.Diagram, container.find('#diagram')[0], {
      grid: $(go.Panel,'Grid',
        $(go.Shape,'LineH',{stroke:'#eee'}),
        $(go.Shape,'LineV',{stroke:'#eee'})
      ),
      'grid.visible':true
    });
    let nodes=[];let links=[];
    for(let i=1;i<=5;i++){
      nodes.push({key:'P'+i,text:'Piso '+i});
      for(let t of ['Oficina','Baño','Impresora','Servidor','AC']){
        const k='P'+i+t;
        nodes.push({key:k,text:t});
        links.push({from:'P'+i,to:k});
      }
    }
    diagram.model=new go.GraphLinksModel(nodes,links);
    container.find('#zin').on('click',()=>diagram.commandHandler.increaseZoom());
    container.find('#zout').on('click',()=>diagram.commandHandler.decreaseZoom());
  }

  /* PDF */
  function pdfApp(){
    if($('#pdf').length){ $('#pdf').show(); return; }
    const container=$('<div class="p-2 overflow-auto h-full"><canvas id="pdfc"></canvas><p class="mt-2 text-sm">Este documento resume los principales problemas detectados durante la auditoría. Se detallan las falencias en metodología y en procesos de desarrollo.</p></div>');
    createWindow('pdf','Documento',container);
    const url='document.pdf';
    const loadingTask=pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf){
      pdf.getPage(1).then(function(page){
        var viewport=page.getViewport({scale:1.5});
        var canvas=document.getElementById('pdfc');
        canvas.height=viewport.height;
        canvas.width=viewport.width;
        var renderContext={canvasContext:canvas.getContext('2d'),viewport:viewport};
        page.render(renderContext);
      });
    });
  }

  function mapApp(){
    if($('#map').length){ $('#map').show(); return; }
    const url='https://www.openstreetmap.org/export/embed.html?bbox=-70.615%2C-33.500%2C-70.606%2C-33.494&layer=mapnik&marker=-33.497%2C-70.610&zoom=17';
    const frame=$('<iframe class="w-full h-full" src="'+url+'"></iframe>');
    createWindow('map','Mapa',frame);
  }

  function salesApp(){
    if($('#sales').length){ $('#sales').show(); return; }
    const container=$('<div class="w-full h-full flex flex-col"><canvas id="salesChart" class="flex-1"></canvas><p class="p-2 text-sm">Hay diferencias con lo reportado por las bases de datos.</p></div>');
    createWindow('sales','Ventas',container);
    new Chart(container.find('#salesChart'),{
      type:'bar',
      data:{
        labels:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
        datasets:[{label:'Ventas',data:[12,19,3,5,2,3,20,15,13,9,7,10],backgroundColor:'rgba(75,192,192,0.5)'}]
      },
      options:{responsive:true,maintainAspectRatio:false}
    });
  }

  function processApp(){
    if($('#procs').length){ $('#procs').show(); return; }
    const today=new Date();
    const dates=[];
    for(let i=0;i<10;i++){
      const d=new Date(today); d.setDate(d.getDate()-i);
      dates.push(d.toISOString().slice(0,10));
    }
    const table=$('<table class="w-full text-center border"/>');
    const thead=$('<thead><tr><th class="border">Sistema</th></tr></thead>');
    dates.forEach(dt=>thead.find('tr').append('<th class="border bg-blue-200">'+dt+'</th>'));
    const tbody=$('<tbody></tbody>');
    const colors={ok:'bg-green-300',fail:'bg-red-300',warn:'bg-yellow-300'};
    for(let i=1;i<=10;i++){
      const tr=$('<tr></tr>');
      tr.append('<td class="border">Sistema '+i+'</td>');
      dates.forEach(()=>{
        const r=Math.random();
        let cls=r<0.33?colors.ok:r<0.66?colors.warn:colors.fail;
        tr.append('<td class="border '+cls+'">&nbsp;</td>');
      });
      tbody.append(tr);
    }
    table.append(thead).append(tbody);
    const legend=$('<p class="p-2 text-sm">Verde: funciona. Amarillo: en observación. Rojo: con fallas. Encabezados celestes indican fechas en revisión.</p>');
    const container=$('<div class="flex flex-col h-full"></div>').append(table).append(legend);
    createWindow('procs','Procesos',container);
  }
});
