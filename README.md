# gorhCli

expériences aves vorpaljs pour faire une cli et automatiser certains workflows autour d'adapt

## usage 

installation

- cloner le repo
- ouvrir un terminal dedans
- ```npm install -g ./```

invocation

```gorh```

### commandes

- ```cl``` effacer le contenu du répertoire
- ```base``` initialiser le répertoire (git, npm, editorconfig)
- ```rc``` crer le fichier yesrc.cson (voir plus bas)
- ```man``` crer les fichier imsManifest.xml (utilse les infos du yesrc)

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

- add zip
- add reorder
- add translation
- add sftp uploads (rsync ?)
- [x] make/read config file in folder
- [x] define and use yesrc.cson

