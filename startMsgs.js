const debug = require('debug')('gorhCli:startMsg')
const msgs = [
  `
 _____         _       _____ __    _____
|   __|___ ___| |_ ___|     |  |  |     |
|  |  | . |  _|   |___|   --|  |__|-   -|
|_____|___|_| |_|_|   |_____|_____|_____|
`,
  `

 ██████╗  ██████╗ ██████╗ ██╗  ██╗       ██████╗██╗     ██╗
██╔════╝ ██╔═══██╗██╔══██╗██║  ██║      ██╔════╝██║     ██║
██║  ███╗██║   ██║██████╔╝███████║█████╗██║     ██║     ██║
██║   ██║██║   ██║██╔══██╗██╔══██║╚════╝██║     ██║     ██║
╚██████╔╝╚██████╔╝██║  ██║██║  ██║      ╚██████╗███████╗██║
 ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝       ╚═════╝╚══════╝╚═╝
`,
  `
╔═╗┌─┐┬─┐┬ ┬     ╔═╗╦  ╦
║ ╦│ │├┬┘├─┤ ─── ║  ║  ║
╚═╝└─┘┴└─┴ ┴     ╚═╝╩═╝╩
`,
  `
  ▄████  ▒█████   ██▀███   ██░ ██     ▄████▄   ██▓     ██▓
 ██▒ ▀█▒▒██▒  ██▒▓██ ▒ ██▒▓██░ ██▒   ▒██▀ ▀█  ▓██▒    ▓██▒
▒██░▄▄▄░▒██░  ██▒▓██ ░▄█ ▒▒██▀▀██░   ▒▓█    ▄ ▒██░    ▒██▒
░▓█  ██▓▒██   ██░▒██▀▀█▄  ░▓█ ░██    ▒▓▓▄ ▄██▒▒██░    ░██░
░▒▓███▀▒░ ████▓▒░░██▓ ▒██▒░▓█▒░██▓   ▒ ▓███▀ ░░██████▒░██░
 ░▒   ▒ ░ ▒░▒░▒░ ░ ▒▓ ░▒▓░ ▒ ░░▒░▒   ░ ░▒ ▒  ░░ ▒░▓  ░░▓
  ░   ░   ░ ▒ ▒░   ░▒ ░ ▒░ ▒ ░▒░ ░     ░  ▒   ░ ░ ▒  ░ ▒ ░
░ ░   ░ ░ ░ ░ ▒    ░░   ░  ░  ░░ ░   ░          ░ ░    ▒ ░
      ░     ░ ░     ░      ░  ░  ░   ░ ░          ░  ░ ░
                                     ░
`,
  `
(_, () /? |-|   ( |_ |
`,
  `
##          #       ##  #   ###
#   ### ### ###     #   #    #
# # # # #   # # ### #   #    #
# # ### #   # #     #   #    #
 ##                  ## ### ###
`,
  `
.sSSSSs.                                                .sSSSSs.    SSSSS       SSSSS
SSSSSSSSSs. .sSSSSs.    .sSSSSSSSs. .sSSS SSSSS         SSSSSSSSSs. SSSSS       SSSSS
S SSS SSSSS S SSSSSSSs. S SSS SSSSS S SSS SSSSS         S SSS SSSSS S SSS       S SSS
S..SS       S..SS SSSSS S..SSsSSSa. S..SSsSSSSS sssssss S..SS       S..SS       S..SS
S:::S sSSs. S:::S SSSSS S:::S SSSSS S:::S SSSSS         S:::S SSSSS S:::S       S:::S
S%%%S SSSSS S%%%S SSSSS S%%%S SSSSS S%%%S SSSSS         S%%%S SSSSS S%%%S SSSSS S%%%S
SSSSSsSSSSS SSSSSsSSSSS SSSSS SSSSS SSSSS SSSSS         SSSSSsSSSSS SSSSSsSS;:' SSSSS
`,
  `
       ___                     __                        ___
  .'|=|_.'    .'|=| .     .'|=|  |   .'| | .        .'|=|_.'   .'|        .'|
.'  |___    .'  | |   . .'  | |  | .'  | |   .    .'  |      .'  |      .'  |
|   | ._|=. |   | |   | |   |=|.'  |   |=|   |    |   |      |   |      |   |
 .  |  __||  .  | |  .' |   |  | . |   | |   |     .  |  ___ |   |  ___ |   |
   .|=|_.''    .|=|.'   |___|  |_| |___| |___|       .|=|_.' |___|=|_.' |___|
`,
  `
   _|_|_|                      _|                      _|_|_|  _|        _|_|_|
 _|          _|_|    _|  _|_|  _|_|_|                _|        _|          _|
 _|  _|_|  _|    _|  _|_|      _|    _|  _|_|_|_|_|  _|        _|          _|
 _|    _|  _|    _|  _|        _|    _|              _|        _|          _|
   _|_|_|    _|_|    _|        _|    _|                _|_|_|  _|_|_|_|  _|_|_|
`,
  `
     dBBBBb  dBBBBP dBBBBBb    dBP dBP             dBBBP  dBP    dBP
            dBP.BP      dBP
   dBBBB   dBP.BP   dBBBBK   dBBBBBP             dBP    dBP    dBP
  dB' BB  dBP.BP   dBP  BB  dBP dBP    dBBBBBP  dBP    dBP    dBP
 dBBBBBB dBBBBP   dBP  dB' dBP dBP             dBBBBP dBBBBP dBP
`
]

function getMsg () {
  const msgLength = msgs.length
  const randNum = Math.floor(Math.random() * (msgLength - 1))
  debug('msg, index / lenght:', randNum, '/', msgLength)
  return msgs[randNum]
}

module.exports = getMsg
