$(document).ready(function(){
    $('ul.tabs').tabs();    
    var storage = window.localStorage;


   document.addEventListener("backbutton", onBackKeyDown, false);

    var lastTimeBackPress=0;
    var timePeriodToExit=2000;

    function onBackKeyDown(e){
        e.preventDefault();
        e.stopPropagation();
        if(new Date().getTime() - lastTimeBackPress < timePeriodToExit){
            navigator.app.exitApp();
        }else{
            navigator.app.backHistory();
            location.href = "index.html";            
        }
        lastTimeBackPress=new Date().getTime();

    };

    // function onBackKeyDown(e){
    //     e.preventDefault();
    //     location.href = "index.html";
    // }
    
    /*LOGIN AUTOMATICO*/
    $('.beforeLogged').hide();
    $('#loading').show();
        $.ajax({
            async: false,
            url  : 'http://uniaoappserver.herokuapp.com/jwtLogin',
            type : 'POST',
            data : {token: storage.getItem('student')},
            error: function(err){
                alert('Por favor, verifique sua conexão com a internet');
                $('#loading').hide();
                $('.beforeLogged').show();
                $('ul.tabs').tabs(); 
                return;
            },
            success: function(student){
                $('#loading').hide();
                if(typeof(student) == 'object'){
                    console.log(typeof(student));
                    $('.logado').show();
                    $('#menu-side').show();
                    console.log(student.nome.split(' ')[0]);
                    $('#logName').text(student.nome.split(' ')[0]);
                    $('.beforeLogged').hide();
                    $('.logado').show();
                }else if(typeof(student) == 'string'){
                    console.log(typeof(student));
                    $('#loading').hide();
                    $('.beforeLogged').show();
                }

            }
        });
    

    $('.crono').click(function(){
        $('.main').addClass('animated bounceOutRight').animate('100', function(){
            $(this).hide();
            $('#loading').show();
        });
        
        setTimeout(function(){
            $.ajax({
                url: 'http://uniaoappserver.herokuapp.com/mobile/cronograma',
                type: 'post',
                data: {token: storage.getItem('student')},
                error: function(err){
                    alert('Erro ao listar cronograma: '+ err);
                    return;
                },
                success: function(teorico){
                    $('.main').hide();
                    $('.logado').show();
                    $('#loading').hide();
                    $('button-collapse').sideNav('destroy');
                    $('.cronograma').remove();
                    if(teorico.length == 0){
                        alert('Nenhuma aula cadastrada no momento');
                    }else{
                        $('body').append('<div class="cronograma"></div>');
                        removeClasses($('.main'));
                        removeClasses($('#map'));
                        removeClasses($('.contactus'));
                        removeClasses($('.cronograma'));
                        removeClasses($('.consultar-exames'));
                        // $('.main').addClass('animated bounceOutRight').animate('100', function(){
                        //     $(this).hide();
                        //     $('#menu-side').addClass('animated bounceOut').hide();
                        //     $('#menu-voltar').addClass('animated flipInX').show();
                        //  });
                        $('#menu-side').addClass('animated bounceOut').hide();
                        $('#menu-voltar').addClass('animated flipInX').show();
                        for(i = 0; i < teorico.length; i++){
                            var data = moment(teorico[i].data).add(24, 'hours')
                            var $disciplina  = teorico[i].disciplina;
                            var $instrutor   = teorico[i].instrutor;
                            var $data        = moment(data).format('ll');
                            var $horaIni     = teorico[i].horaIni;
                            var $horaFim     = teorico[i].horaFim;

                           
                           var $divider = $('<div>').attr('class', 'divider');
                           var $disc = $('<h3>').html($disciplina).append($divider);
                           var $dia  = $('<h5>').html('Data: '+$data);
                           var $inst = $('<h5>').html('Instrutor: '+$instrutor);
                           var $hi   = $('<h5>').html('Início: '+$horaIni);
                           var $hf   = $('<h5>').html('Fim: '+$horaFim);

                           var $container = $('<div>').attr('class', 'container');

                           $container.append($dia)
                              .append($inst)
                              .append($hi)
                              .append($hf);

                            var $row        = $('<div>').attr('class','row');
                            var $col        = $('<div>').attr('class', 'col s12 m6 ');
                            var $card       = $('<div>').attr('class', 'card teal teorico');
                            var $content    = $('<div>').attr('class', 'card-content white-text');
                            var $span       = $disc.attr('class', 'card-title center-align');
                            var $action     = $('<div>').attr('class', 'card-action'); 

                            $content.append($span).append($container);
                            $card.append($content).append($action);
                            

                            $col.append($card);
                            $row.append($col);
                            $('.cronograma').append($row);

                        }
                    }
                   $('.cronograma').addClass('animated bounceInLeft').show();
                }
            });
        },3000);
    });
        
    
    
   $('.logout').click(function(){
       localStorage.removeItem('student');
       location.reload();
   });
    
    
    //MASCARA PARA CPF//
    $('#cpf').mask('000.000.000-00');
    

    
    /* ROTA PARA UNIAOAPPSERVER*/
    
    $('#auth').submit(function(e){
        e.preventDefault();
        $('.beforeLogged').hide();
        $('#loading').show();
        setTimeout(function(){
            $.ajax({
                async: false,
                url: 'https://uniaoappserver.herokuapp.com/studentAuth',
                type: 'post',
                dataType: 'json',
                data: {cpf: $('#cpf').val()},
                error: function(err){
                    alert('Aluno não cadastrado');
                    $('#loading').hide();
                    $('.beforeLogged').show();
                    return;
                },
                success: function(student){
                    $('#loading').hide();
                    storage = window.localStorage;
                    var value = storage.setItem('student', student.token);
                    $('.beforeLogged').hide();
                    $('.logado').addClass('animated bounceInLeft').show();
                    $('#menu-side').show();
                    $('#logName').text(student.nome.split(' ')[0]);
                    var $toast = $('<span"> Oi, '+ student.nome.split(' ')[0]+'. Tudo ok?'+ '</span>');
                    Materialize.toast($toast, 5000, 'myToast');
                }
            });
        },5000);
        
        
        
    });
    
    
    
    /* Configurações do Mapa  */

    function initMap(){
        var myLat = {lat:-22.248762, lng:-53.350253 };
        var map = new google.maps.Map(document.getElementById('mapa'),{
            center: myLat,
            zoom: 16
        });
        var marker = new google.maps.Marker({
            position: {lat:-22.2486856,lng:-53.3501183},
            map: map,
            title: 'Autoescola União'
        });
        marker.setMap(map);

    }


    //FAZ LIGAÇÃO//

    $('.fone').on('click', function(){
        PhoneDialer.dial("996426145", onSuccess, onError);

        function onSuccess(result){
          console.log("Success:"+result);
        }
         
        function onError(result) {
          console.log("Error:"+result);
        }
    });


    // ENVIA EMAIL//

    document.addEventListener('deviceready', function () {
        $('#email-form').submit(function(e){

            var nome = $('#nome').val();
            var email = $('#email').val();
            var cel = $('#fone').val();
            var conteudo = 'Mensagem: \n'+ $('#textarea').val() +'\nFone: '+ cel;

            cordova.plugins.email.open({
                to:'uniaocontato@gmail.com',
                subject: 'Mensagem de: '+ nome,
                body: conteudo
            });
        });

        $('#contato-form').submit(function(e){

            var nome = $('#c-nome').val();
            var email = $('#c-email').val();
            var cel = $('#c-fone').val();
            var conteudo = 'Mensagem: \n'+ $('#c-textarea').val() +'\nFone: '+ cel;

            cordova.plugins.email.open({
                to:'uniaocontato@gmail.com',
                subject: 'Mensagem de: '+ nome,
                body: conteudo
            });
        });


    });


        $('.collapsible').collapsible({
            popout: true
        });

        $(document).ready(function(){
            $('.materialboxed').materialbox();
        });

        $(".button-collapse").sideNav({
            menuWidth: 270
        });


        //$('#cpf').mask('000.000.000-00')
        $('#fone').mask('(00) 0000-00009');
        $('#c-fone').mask('(00) 0000-00009');
        $('#fone').blur(function(event) {
            if($(this).val().length == 15){ // Celular com 9 dígitos + 2 dígitos DDD e 4 da máscara
              $('#fone').mask('(00) 00000-0009');
            } else {
              $('#fone').mask('(00) 0000-00009');
           }
        });


        //Only Android... for a while ==> Redireciona a página da autoescola para app FB ou InAppBrowser
        $('.fb').on('click', function(){
            appAvailability.check(
                'com.facebook.katana',
                function(){
                    cordova.InAppBrowser.open('fb://page/164048987036649', '_system', 'location=no');
                },
                function(){
                   cordova.InAppBrowser.open('http://facebook.com/164048987036649', '_blank', 'location=yes');
                }
            );
        });

        $('.simulado').on('click', function(){
            var simulados = ['http://simulado.detran.rj.gov.br/simulados/iniciarProva/habilitacao'];

            var rand = simulados[Math.floor(Math.random() * simulados.length)];
        //    
        //    cordova.InAppBrowser.open(rand, '_blank', 'location=yes, hardwareback=yes');

            var ref = cordova.InAppBrowser.open(rand, '_blank', 'location=yes, hidden=yes', 'hardwareback=no');

//            ref.addEventListener('loadstart', function(){alert('Carregando...');});
//            ref.addEventListener('loadstop', function(){alert('Parando..');});
//            ref.addEventListener('loaderror', function(){alert('Deu alguma merda...');});

        });

        $('#policy').click(function(){
            cordova.InAppBrowser.open('http://uniaoappserver.herokuapp.com/politicaDePrivacidade');
        });

        $('#sim-regulamentacao').click(function(){
           cordova.InAppBrowser.open('http://simuladodetranbrasil.com.br/simulado-detran-placas-de-regulamentacao/', '_blank', 'location=yes'); 
        });

        $('#sim-advertencia').click(function(){
            cordova.InAppBrowser.open('http://simuladodetranbrasil.com.br/simulado-detran-placas-de-advertencia/', '_blank', 'location=yes');
        });

        $('#sim-obras').click(function(){
            cordova.InAppBrowser.open('http://simuladodetranbrasil.com.br/simulado-detran-placas-de-sinalizacao-de-obras/', '_blank', 'location=yes');
        });

        $('#sim-auxiliar').click(function(){
            cordova.InAppBrowser.open('http://simuladodetranbrasil.com.br/simulado-detran-placas-auxiliares/', '_blank', 'location=yes');
        });

        function removeClasses(e){
            e.removeClass('animated bounceOutRight bounceInLeft flipInX bounceOut');
        };

        $('.contact').on('click', function(){
            $('button-collapse').sideNav('destroy');
            removeClasses($('.main'));
            removeClasses($('#map'));
            removeClasses($('#contactus'));

            $('.main').addClass('animated bounceOutRight').animate('100', function(){
                $(this).hide();
                $('.contactus').addClass('animated bounceInLeft').show();
                $('#menu-side').addClass('animated bounceOut').hide();
                $('#menu-voltar').addClass('animated flipInX').show();
            });
        });

        $('#local').on('click', function(){
            removeClasses($('.main'));
            removeClasses($('#map'));
            removeClasses($('.contactus'));


            $('.main').addClass('animated bounceOutRight').animate('100', function(){
                $(this).hide();
                $('#map').addClass('animated bounceInLeft').show();
                $('#mapa').addClass('animated bounceInLeft').show();
                $('#menu-side').addClass('animated bounceOut').hide();
                $('#menu-voltar').addClass('animated flipInX').show();
                /*        Iniciando o Mapa*/
                initMap();
            });
        });

        $('#quem-somos').on('click', function(){
            $('button-collapse').sideNav('destroy');
            removeClasses($('.main'));
            removeClasses($('#map'));
            removeClasses($('.contactus'));
            removeClasses($('.consultar-exames'));

            $('#map').hide();
            $('#mapa').hide();
            $('.contactus').hide();

           $('.main').addClass('animated bounceOutRight').animate('100', function(){
                $(this).hide();
                $('.quem-somos').addClass('animated bounceInLeft').show();
                $('#menu-side').addClass('animated bounceOut').hide();
                $('#menu-voltar').addClass('animated flipInX').show();
            });

        });

        $('#menu-voltar').on('click', function(){
            removeClasses($('.main'));
            removeClasses($('#map'));
            removeClasses($('.contactus'));
            removeClasses($('.consultar-exames'));
            removeClasses($('#quem-somos'));

            $('#loading').hide();
            $('.cronograma').hide();
            $('.consultar-exames').html('');
            $('.consultar-exames').hide();
            $('#map').hide();
            $('#mapa').hide();
            $('.contactus').hide();
            $('.main').addClass(' animated bounceInLeft').show();
            $('#menu-voltar').addClass('animated bounceOut').hide();
            $('.quem-somos').hide();
            $('#menu-side').addClass('animated flipInX').show();
        });



    // /* FUTURAMENTE TRATAR O SCROLL DO FORM 'FALEf# CONOSCO'*/
    // $('#textarea').focus(function(){
    //     $('.contactus').css('max-heigth','200');
    //     window.addEventListener('native.keyboardshow', keyboardShowHandler);
    // });

    // function keyboardShowHandler(e){
    //         var d = $('.contactus');
    //         d.scrollTop(d.prop("scrollHeight"));
    // };


    $('#consultar-exames').click(function(e){
        e.preventDefault();
        removeClasses($('.main'));
        removeClasses($('#map'));
        removeClasses($('.contactus'));
        removeClasses($('.consultar-exames'));

        $('#map').hide();
        $('#mapa').hide();
        $('.contactus').hide();

       $('.main').addClass('animated bounceOutRight').animate('100', function(){
            $(this).hide();

            $('#menu-side').addClass('animated bounceOut').hide();
            $('#menu-voltar').addClass('animated flipInX').show();
            $('#loading').show();
        }); 
        setTimeout(function(){
            $.ajax({
                url: 'http://www.detran.ms.gov.br/consulta-de-exames/',
                type: 'get',
                dataType: 'html',
                data: '',
                error: function(){
                  alert('Servidor fora do ar. Tente mais tarde.')
                },
                success: function(el){
                    var $frame = el;
                    var $conteudo = $($frame).find('iframe').attr('id', 'myframe'); 
                    $('#loading').hide();
                    $('.consultar-exames').append($conteudo).show();
                }
            });
        },3000);
        
    });
});

