$(function(){
  // make icons draggable
  $(".icon").draggable({containment:'#desktop'});

  let z=1;
    function createWindow(id,title,content){
      if($("#"+id).length){ $("#"+id).show().css('z-index',z++); return; }
      const win=$("<div class='window fixed inset-x-0 top-8 bottom-12 bg-white rounded shadow-lg flex flex-col'></div>");
      win.attr('id',id).css('z-index',z++);
      const header=$("<div class='window-header bg-gray-200 flex items-center px-2 py-1'><div class='flex space-x-1'><span class='circle close'></span><span class='circle min'></span><span class='circle max'></span></div><div class='flex-1 text-center drag-handle font-semibold'>"+title+"</div></div>");
      const body=$("<div class='flex-1 overflow-auto p-2'></div>").append(content);
      win.append(header).append(body);
      header.find('.close').on('click',()=>win.hide());
      header.find('.min').on('click',()=>win.hide());
      header.find('.max').on('click',()=>win.toggleClass('fixed').toggleClass('absolute'));
      $('#windows').append(win);
      win.draggable({handle:'.window-header'}).resizable({handles:'all',containment:'#desktop'});
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
        createWindow('map','Mapa','<iframe class="w-full h-64" src="https://www.openstreetmap.org/export/embed.html"></iframe>');break;
      case 'safari':
        createWindow('safari','Navegador','<p>Navegador simple.</p>');break;
      case 'settings':
        createWindow('settings','Ajustes','<p>Ajustes del sistema.</p>');break;
      case 'store':
        createWindow('store','Tienda','<p>Aplicaciones disponibles.</p>');break;
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
    createWindow('db','Bases de Datos',tree);
  }

  function sampleData(){
    // generate data once
    if(window.sample) return window.sample;
    function rand(arr){return arr[Math.floor(Math.random()*arr.length)];}
    const names=['Ana','Luis','Pedro','Maria','Juan','Carla','Diego','Sofía'];
    const ap=['Gomez','Perez','Soto','Rojas'];
    const religions=['Católica','Atea','Judía','Musulmana'];
    let personales=[];
    for(let i=0;i<50;i++){
      personales.push({Nombre:rand(names)+' '+rand(ap),RUT:'1'+i+'-K',Direccion:'Calle '+i,Religion:rand(religions),Sueldo:1000+i,Estado:'Soltero'});
    }
    let boletas=[];for(let i=0;i<50;i++)boletas.push({Boleta:i+1,Producto:'Prod'+i,Precio:(i*3)%100});
    let catalogo=[];for(let i=0;i<50;i++)catalogo.push({Codigo:'P'+i,Especificacion:'Tecnica '+i});
    let enemigos=[];for(let i=0;i<50;i++)enemigos.push({ID:i,Descripcion:'Enemy '+i,Nivel:i%10,Ubicacion:'Lugar '+i});
    let viajes=[];for(let i=0;i<50;i++)viajes.push({RUT:'1'+i+'-K',Origen:'Ciudad'+i,Destino:'Destino'+i,Fecha:'2025-01-'+((i%30)+1),Duracion:i+'h'});
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
    const container=$('<div class="flex h-64"></div>');
    const list=$('<ul class="w-1/3 border-r overflow-auto"></ul>');
    const view=$('<div class="w-2/3 p-2"></div>');
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
    const cyDiv=$('<div id="cy" style="width:100%;height:400px;"></div>');
    createWindow('graph','Grafo',cyDiv);
    const cy=cytoscape({
      container:cyDiv[0],
      elements:[
        {data:{id:'piso1',label:'Piso 1'}},
        {data:{id:'piso2',label:'Piso 2'}},
        {data:{id:'piso3',label:'Piso 3'}},
        {data:{id:'server1',label:'Servidor sin AC'}},
        {data:{id:'server2',label:'Servidor en baño'}},
        {data:{id:'it1',label:'Oficina TI'}}
      ],
      edges:[
        {data:{source:'piso1',target:'server1'}},
        {data:{source:'piso2',target:'server2'}},
        {data:{source:'piso3',target:'it1'}}
      ],
      style:[
        {selector:'node',style:{label:'data(label)', 'background-color':'#1a56db', color:'#fff', 'text-valign':'center'}},
        {selector:'edge',style:{'line-color':'#ccc','target-arrow-color':'#ccc','target-arrow-shape':'triangle'}}
      ],
      layout:{name:'breadthfirst'}
    });
  }

  /* PDF */
  function pdfApp(){
    if($('#pdf').length){ $('#pdf').show(); return; }
    const container=$('<div><canvas id="pdfc"></canvas></div>');
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
});
