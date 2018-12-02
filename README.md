# CIAONE

## How to start up
- Run populate.sh (```sh ./populate.sh```, do _not_ run as root)
- Copy network.config.json.TEMPLATE as network.config.json in ./src, ./backend
Edit the files with values.\
- *DO NOT EDIT .TEMPLATE FILE!*

## How to deploy
- edit deploy.sh, edit line 1 with the architecture list you want
- yarn deploy
- cd output && sh run.sh <arch> (EX. ```sh run.sh -linux-x64```)

## Funzionalitá:
- [x] Login
- [x] Rete diversa: routes diverse
- [x] Gestione utenti: se admin tutti, altrimenti solo il proprio
- [x] Aggiornamento previlegi
- [x] Creazione nuovo utente
- [ ] Login con usb (richiede server locale)
- [x] Logout dopo inattivitá

## Known bugs
( [x] RESOLVED, [ ] WORKING ON maybe...)
- [x] Gestione utenti: i previlegi non sono mostrati fino al click sull'utente accanto
- [ ] Gestione utenti: le caselle di testo non vengono aggiornate
- [ ] Tasto invio non va il login.
- [ ] Login non aggiornato al refresh della pagina di gestione utenti.
- [ ] Privilegi non aggiornati al nuovo utente =(
- [ ] Su cellulare +/- overlap nel carrello
