import { Component, OnInit } from '@angular/core';

import { AppState } from '../../../app.service';

@Component({
  /**
   * The selector is what angular internally uses
   * for `document.querySelectorAll(selector)` in our index.html
   * where, in this case, selector is the string 'home'.
   */
  selector: 'new',  // <home></home>
  /**
   * We need to tell Angular's Dependency Injection which providers are in our app.
   */
  providers: [

  ],
  /**
   * Every Angular template is first compiled by the browser before Angular runs it's compiler.
   */
  templateUrl: './new.component.html'
})
export class NewComponent implements OnInit {
  /**
   * TypeScript public modifiers
   */
  test: Array<string> = [""]
  env: Array<string> = []
  ports: Object = {
      "26900/udp":[{
          HostIp:"",
          HostPort:"26900"
      }]
  }
  public body: any = {
      name:"",
      Image:"",
      Env:[],
      Cmd:"",
      HostConfig:{
        Binds:[],
        PortBindings:{

        },
        CapAdd:[],
        Privileged: false,
        SecurityOpt:[]
      }
  }
  constructor(
    public appState: AppState
  ) {

  }

  public ngOnInit() {
    console.log('hello `Servers New` component');
    /**
     * this.title.getData().subscribe(data => this.data = data);
     */
  }
  /*
  // autogenerate name, but give input for name
  // Port Mapper
    // HostConfig.PortBindings
    // Port to Port inputs
  // Env
    // Key: value => [key=value]
  // Cmd (default)
  // Image (default)
  // Volumes
    // HostConfig.Bindings [""]
  // CapAdd [""]
  // Privileged checkbox
  // Security Opt [""]
            "CapAdd": [
                "ALL"
            ],
            "Privileged": true,
            "SecurityOpt": [
                "seccomp:unconfined",
                "label=disable"
            ]
    {
        name:"/csgosrcds_csgo-srcds_1",
        "ExposedPorts": {
            "26900/udp": {},
            "27015/tcp": {},
            "27015/udp": {},
            "27020/udp": {},
            "8100/tcp": {}
        },
        "Env": [
            "REDIS_HOST=redis-csgonet",
            "NODE_ENV=development-local",
            "CSGO_IMAGE_PATH=/var/images/599d119bb31dd80001c79df9.qcow2",
            "CSGO_SERVER_ID=1234567",
            "CSGO_START_ARGV=-game csgo -console -usercon +game_type 0 +game_mode 1 +map de_dust2 +ip 127.0.0.1",
            "CSGO_START_EXEC=/var/app/csgo/srcds_run",
            "REDIS_PORT=6379"
        ],
        Cmd:"node server.js",
        "Image": "csgosrcds_csgo-srcds",
        Voumes: {
            "/var/images": {}
        },
        "WorkingDir": "/var/app",
        "HostConfig": {
            "Binds": [
                "/C/Users/raster/Documents/csgo-pub/images:/var/images:rw"
            ],
            "PortBindings": {
                "26900/udp": [
                    {
                        "HostIp": "", // or ip address
                        "HostPort": "26920"
                    }
                ],
                "27015/tcp": [
                    {
                        "HostIp": "",
                        "HostPort": "27015"
                    }
                ],
                "27015/udp": [
                    {
                        "HostIp": "",
                        "HostPort": "27015"
                    }
                ],
                "27020/udp": [
                    {
                        "HostIp": "",
                        "HostPort": "27020"
                    }
                ]
            },
            "CapAdd": [
                "ALL"
            ],
            "Privileged": true,
            "SecurityOpt": [
                "seccomp:unconfined",
                "label=disable"
            ]
        },
    }
  */
}
