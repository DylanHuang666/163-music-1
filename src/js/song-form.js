

{
    let view={
        el:'.page>main',
        init(){
            this.$el=$(this.el)
        },
        template:`
        <form class="form">
            <div class="row">
                <label for="">
                    歌名                       
                </label>
                <input type="text" name="name" value="__name__">
            </div>
            <div class="row">
                <label for="">
                    歌手    
                </label>
                <input type="text" name="singer" value="__singer__">
            </div>
            <div class="row">
                <label for="">
                    外链                      
                </label>
                <input type="text" name="url" value="__url__">
            </div>
            <div class="row actions">
                <button type="submit">保存</button>
            </div>
        </form>
        `,
        render(data={}){
            let placeholders=['name','singer','url','id']
            let html=this.template
            placeholders.map((string)=>{
                html=html.replace(`__${string}__`,data[string]||'')
            })
            $(this.el).html(html)
            if(data.id){
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            }else{
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset(){
            this.render({})
        }
    }
    let model={
        data:{
            name:'',singer:'',url:'',id:''
        },
        create(data){ //保存数据到数据库
            // 声明类型
            var Song = AV.Object.extend('Song');
            // 新建对象
            var song = new Song();
            // 设置名称
            song.set('name',data.name);
            song.set('singer',data.singer);
            song.set('url',data.url);
            // // 设置优先级
            // songr.set('priority',1);
            return song.save().then((newSong)=> {
                let {id,attributes}=newSong
                Object.assign(this.data,{ //model.data
                    id:id,
                    name:attributes.name,    //这四句话相等于{id,...attributes}
                    singer:attributes.singer,
                    url:attributes.url
                })
            }, function (error) {
                console.error(error);
            });
        }
    }
    let controller={
        init(view,model){
            this.view=view
            this.view.init()
            this.model=model  
            this.view.render(this.model.data)
            this.bindEvents()
            // window.eventHub.on('upload',(data)=>{
            //     this.model.data=data
            //     this.view.render(this.model.data)
            // })
            window.eventHub.on('select',(data)=>{
                this.model.data=data
                this.view.render(this.model.data)
            })
            window.eventHub.on('new',(data)=>{
                if(data===undefined){
                    this.model.data={
                        name:'',singer:'',url:'',id:''
                    }
                }
                this.model.data=data              
                this.view.render(this.model.data)
            })
        },
        bindEvents(){
            this.view.$el.on('submit','form',(e)=>{
                e.preventDefault()
                let needs='name singer url'.split(' ')
                let data={}
                needs.map((string)=>{
                    data[string]=this.view.$el.find(`[name="${string}"]`).val() //得到data(nama,singer,url)
                })
                this.model.create(data).then(()=>{
                    this.view.reset()
                    let string=JSON.stringify(this.model.data)
                    let object=JSON.parse(string)
                    window.eventHub.emit('create',object)                 
                })
            })
        }
    }
    controller.init(view,model)
}