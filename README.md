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

### yesrc.cson

le fichier yesrc.json est un fichier qui a pour but a terme de contenir toutes 
les informations dont les outils de build on besoins. pour le moment sont implémentés :
il est en CSON, pour les commentaires et la syntaxe épurée, a voir si on rends 
ca compatible json aussi (yesrc.json, facile a faire)

- coursePath : chemin vers le dossier src a partir de la racine du projet
- buildsPath : chemin vers le dossier ou les builds sont réunis (pour les manifestes)
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
- add build command

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
