# Mode d'emploi

## Etape 1

Créer un dossier portant le nom du module dans le dossier src

## Etape 2

Créer tous les fichiers nécessaires à votre module dont un portant le nom du module avec l'extension .jsx dans le sous-dossier portant le nom du module

## Etape 3

Dans le fichiers portant le nom du module avec l'extension .jsx créer un méthode exporter par défault prenant **React, React, Router, Material, Dashboard, grafone** en paramètre.

```js
const MonModule = (React, Router, Material, , grafone) => { }

export default MonModule
```

## Etape 4

C'est dans la fonction portant le nom du module que l'on va créer le composant et le retourner.

Tous les éléments venant de la librairie react devront être appellé avec le paramètre de la méthode (React.useState( ), React.useEffect( ), etc...).

Les autres éléments pourront être importé normalement.

```js
const MonModule = (React, Router, Material, Dashboard, grafone) => { 
    const Composant = props => {
        //code du composant
    }

    return Composant
}
```

## Etape 5

Pour builder le module il faut le rajouter à la liste des paths de composant dans webpack.config.js

```js
const modulesPaths = [
    require.resolve('./src/monModule/MonModule.jsx'),
]
```

## Etape 6

Chaque module déclaré dans le tableau *modulesPaths* est buildé et enregistrer dans le dossier build sous l'appelation du fichier .jsx. 

## Etape 7

Pour tester le module il faut lancer la commande **npm run build-module** et zipper le fichier builder sur /build et le importer sur le grafone > paramètrage > plugins > importer.