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

invocation

```gorh```

### commandes

- ```init``` initialiser le répertoire (git, npm, editorconfig)
- ```rc``` crer le fichier yesrc.cson (voir plus bas)
- ```manifest``` crer les fichier imsManifest.xml (utilse les infos du yesrc)
- ```clear``` effacer le contenu du répertoire


## Configuration
### .gorhClirc

le fichier .gorhClirc est un fichier qui a pour but a terme de contenir toutes les informations dont les outils de build on besoins. 
Il est mainteant en Json, ou peux ete en init

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

- add zip command
- add reorder command
- add translation command
  - make the translation system modular
  - make entry in the yesrc
- add sftp uploads (rsync ?) command
- use getDirsInfos fn in manifest
- add build command
- 

- create an init function for the cli
  - load rc if there is one
    - check that all rc courses dirs exist
- modularise all commands
- switch to promises ?
- write test for all function
- learn how to test commands

## done
- [x] make/read config file in folder
- [x] define and use yesrc.cson
