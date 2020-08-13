const DEMO_INSTANCE = 'c14847252'

Vue.use(VueRouter)

const sdk = new PrevioletSDK({
  instance: DEMO_INSTANCE,
  appVersion: '1.0.0',
  debug: true,
})

sdk.remoteConfig().defaultConfig({
  'welcome_message': 'Hello!',
})

Vue.use(VueAuthenticate, {
  tokenName: 'access_token',

  // The redirectUri for each provider is:
  // https://c14847252.eu.east1.previolet.com/v1/__/auth/<provider>
  // VueAuthenticate automatically appends /auth/<provider> to the baseUrl so we just need to set it as:
  baseUrl: 'https://' + DEMO_INSTANCE + '.eu.east1.previolet.com/v1/__/',
  storageType: 'cookieStorage',
  providers: {
    github: {
      clientId: '<GITHUB_CLIENT_ID>',
    },
    google: {
      clientId: '<GOOGLE_CLIENT_ID>',
    },
  }
})

var router = new VueRouter({
  mode: 'history',
  routes: [
    { 
      path: '/',
      name: 'index',
      component: {
        data: function () {
          return {
            sdk,
            authenticated: false,
            token: false,
            application: {
              name: '',
              description: '',
            },
            applicationRegion: false,
            databases: [],
            records: [],
            docs: [],
            functions: [],
            files: [],
            selectedDatabase: false,
            rawRecord: null,
            registerProcess: {
              start: false,
              identity: false,
              email: '',
            },
            lastUsedIdentityProvider: false,
            currentUser: {
              email: ''
            },
            remoteConfig: {},
          }
        },
        template: `
          <div class="index-component">
            <div v-if="! authenticated">
              <img class="logo" src="logo.png">
              <p>
                This is a demo setup for the Previolet Javascript SDK. 
                The instance is linked to an existing application in order to showcase authentication, storage and processing abilities.
              </p>
              <ul>
                <li><a href="javascript:;" @click="login">Login with test credentials</a></li>
                <li><a href="javascript:;" @click="auth(sdk.auth().GoogleAuthProvider.id)">Login with Google</a></li>
                <li><a href="javascript:;" @click="auth(sdk.auth().GithubAuthProvider.id)">Login with Github</a></li>
              </ul>

              <div v-if="registerProcess.start">
                <h2>Register</h2>
                <img class="avatar" :src="registerProcess.identity.avatar"> <br/>
                <p>Hi <strong>{{ registerProcess.identity.first_name }}</strong>! It seems you don't have an account with us, please confirm your email address and press Register to continue.</p>
                <input type="text" v-model="registerProcess.email" placeholder="Enter your email here">
                <a href="javascript:;" @click="registerUser">Register</a> or 
                <a href="javascript:;" @click="cancelRegister">Cancel</a>
              </div>
            </div>
            <div v-else>
              <a class="pull-right" href="javascript:;" @click="logout">Logout</a>
              <img class="logo" src="logo.png">

              <p>You are now authenticated as <strong>{{ currentUser.email }}</strong></p>
              <p v-if="application.description">{{ application.description }}</p>

              <div v-if="records.length">
                <h2>Todos</h2>
                <ul>
                  <li v-for="todo in records">
                    <input type="checkbox" :checked="todo.done ? 'checked' : ''" />
                    {{ todo.item }}
                  </li>
                </ul>
              </div>

              <div v-if="docs.length">
                <h2>Resources</h2>
                <ul>
                  <li v-for="link in docs">
                    <a :href="link.url" target="_blank">{{ link.title }}</a>
                  </li>
                </ul>
              </div>

              <div v-if="functions.length">
                <h2>Functions</h2>
                <ul>
                  <li v-for="func in functions">
                    <a @click="runFunction(func.id)" href="javascript:;">{{ func.name }}</a>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        `,
        methods: {
          login () {
            const vm = this

            sdk.auth().loginWithUsernameAndPassword(
              'john@obviouslyjoe.com', 
              'demoaccount').catch(err => {
              alert(err)
            })
          },

          logout() {
            const vm = this
            sdk.auth().logout().then(ret => {
              // logout is complete
            })
          },

          loadData() {
            const vm = this

            if (! vm.authenticated) {
              return
            }

            vm.selectedDatabase = false
            vm.token = sdk.app().token
            vm.application = sdk.app().data
            vm.applicationRegion = sdk.app().region
            vm.currentUser = sdk.user().data

            // Get todo items
            sdk.db().select('todo').get().then(ret => {
              vm.records = ret
            })

            // Get documentation items ordered by the creation date
            sdk.db().select('docs').get({_sort: '_created.1'}).then(ret => {
              vm.docs = ret
            })

            sdk.remoteConfig().get().then(config => {
              console.log('remoteConfig', config)
            })
          },

          runFunction(id) {
            sdk.functions().run(id).then(ret => {
              if (ret.return) {
                alert(ret.return)
              }

              if (ret.error) {
                alert(ret.error)
              }

              if (ret.errorMessage) {
                alert(ret.errorMessage)
              }
            })
          },

          auth(provider) {
            const vm = this
            vm.lastUsedIdentityProvider = provider

            vm.$auth.authenticate(provider).then((authResponse) => {
              sdk.auth().loginWithIdentityProvider(provider, authResponse.data.access_token).then(ret => {
                if (! ret.registered) {
                  // the user is not registered with this identity, start the registration process
                  vm.registerProcess.identity = ret.map

                  if (ret.map && ret.map.email) {
                    vm.registerProcess.email = ret.map.email
                  }

                  vm.registerProcess.start = true
                }
              })
            })
          },

          cancelRegister () {
            const vm = this
            vm.registerProcess.start = false
            vm.registerProcess.identity = false
          },

          registerUser () {
            const vm = this

            if (vm.registerProcess.email.trim() == '') {
              alert('Please enter an email address')
              return
            }

            sdk.auth().registerWithIdentityProvider(vm.lastUsedIdentityProvider, vm.registerProcess.email).then(ret => {
            }).catch(err => {
              alert(err)
            })
          },
        },

        created () {
          const vm = this

          sdk.auth().onAuthStateChanged((user) => {
            if (user) {
              vm.authenticated = true
              vm.loadData()
            } else {
              vm.authenticated = false
              vm.registerProcess.start = false
            }
          })

          // Register a log entry
          sdk.bucket().log(1, {url: window.location.href})
        }
      } 
    }
  ]
})

var app = new Vue({
  router: router
}).$mount('#app')