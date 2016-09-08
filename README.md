# gorhCli

expériences aves vorpaljs pour faire une cli et automatiser certains workflows autour d'adapt

## usage 

###installation

- cloner le repo
- ouvrir un terminal dedans

#### release

- ```npm install -g ./```
- ```npm link```


#### en dev ou pour utiliser develop

- ```git checkout develop```
- ```npm install -g ./```
- ```npm link```

tapper ```gorh``` (mais pas trop fort)

### commandes

- ```clear``` effacer le contenu du répertoire
- ```rc``` crer le fichier .gorhclirc.cson (voir plus bas)
- ```init``` initialiser le répertoire (git, npm, editorconfig)
- ```build``` build tout les cours du .gorhclirc
- ```manifest``` crer les fichier imsManifest.xml (utilse les infos du .gorhclirc)
- ```zip``` zip les repertoires du build
- ```make``` initialiser le répertoire (git, npm, editorconfig)
- ```switch``` enchaine build, manifest et zip

## Configuration

### .gorhClirc

le fichier .gorhClirc est un fichier qui a pour but a terme de contenir toutes les informations dont les outils de build on besoins. 
Il est mainteant en Json, ou peut aussi utiliser le standard ini.

le fichier de configuration est utilisé pour les projet autour d'adapt, et assument une certaine hierarchie et un workflow.

par defaut le cour de base s'appelle 'course-00', 'course' n'est pas a utiliser, il sera symlinké par le processus de build !!!

la configuration est chargé en utilisant le module [rc](https://github.com/dominictarr/rc) ce qui permet d'avoir aussi une config globale dans la home.

pour le moment sont implémentés :

- coursePath : chemin vers le dossier src a partir de la racine du projet
- buildsPath : chemin vers le dossier ou les builds sont réunis (pour les manifestes)
- version: si non spécifié, la version courrante de la cli sera utilisée
- courses : un array d'objets contenant les infos des divers cours pour les fichier multicours
  - name : nom du cours, DOIS etre le nom du répertoire correspondant dans /src
  - scTxt: scorm data (souvent vide chez yes)
  - scManifest: scorm data identifiant unique
  - scScormUid: scorm data identifiant unique

## to do

- [] use rcconfig in vorpal il all cmds
- [x] fix path issues
  - [x] get root dir from config (where the .rcfile is located) (made for swCmd)
- [ ] add reorder command
- [ ] add translation command
  - [ ] make the translation system modular
  - [ ] make entry in the .gorhclirc
- [ ] add sftp uploads (rsync ?)
- [ ] switch to promises ?
- [ ] write test for all function
- [x] make/read config file in folder
- [x] define and use .gorhclirc.cson
- [x] add build command
- [x] add zip
- [x] modularise all commands
  - [] buildCmd
  - [x] clearCmd
- [x] create an init function for the cli
  - [x] load rc if there is one
  - [x] check that all rc courses dirs exist

## SUGAR

- update start message
  - read pkg and diplay info in the message
  - make it a vorpal extention
