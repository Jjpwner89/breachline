// Accounts on the copy hosted outside Claude: a name and a password, through Firebase, so progress and decks follow a player to
// other devices. Inside Claude the page's own account does this and nothing here loads. Firestore stands in for the Claude
// page's database behind the same calls, so progress.js and decks.js sync the same way in both places, at the same paths.
var Accounts = (function () {
  var NAME = 'breachline.account', DOMAIN = '@breachline.game', BASE = 'https://www.gstatic.com/firebasejs/13.1.0/';
  var available = typeof window !== 'undefined' && !(window.claude && window.claude.use) && typeof FIREBASE_CONFIG !== 'undefined';
  // What this browser keeps for one player. The account holds the real copy, so this is cleared when a player signs out,
  // and when someone signs in to an account that already has progress of its own.
  var LOCAL = ['breachline.progress.v1', 'breachline.decks.v1', 'breachline.decks.v1.deleted', 'breachline.picks.v1', 'breachline.campaign.v1', 'breachline.match.v1'];
  var fb = null, current = null;

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function clearLocal() { LOCAL.forEach(function (k) { write(k, null); }); }

  // Firebase loads only for a player who has signed in on this browser, so guests never fetch it.
  function load() {
    if (!fb) fb = Promise.all(['app', 'auth', 'firestore'].map(function (m) { return import(BASE + 'firebase-' + m + '.js'); })).then(function (m) {
      var app = m[0].initializeApp(FIREBASE_CONFIG);
      return { A: m[1], F: m[2], auth: m[1].getAuth(app), db: m[2].getFirestore(app) };
    }, function (e) { fb = null; throw e; });
    return fb;
  }
  // The signed-in Firebase user, or null. Firebase remembers the sign-in in this browser until the player signs out.
  function who() {
    if (!current) current = !available || !read(NAME) ? Promise.resolve(null) : load().then(function (f) {
      return new Promise(function (done) {
        var stop = f.A.onAuthStateChanged(f.auth, function (u) { stop(); done(u); });
      });
    }).then(function (u) { if (!u) write(NAME, null); return u; }, function (e) {
      console.warn('Your account can\'t be reached right now, so this browser\'s copy is used:', e && e.message);
      current = null;
      return null;
    });
    return current;
  }

  // The few calls progress.js and decks.js make on the Claude page's database, answered by Firestore.
  function database(f) {
    var F = f.F;
    function coll(ref) {
      return {
        doc: function (k) { return item(F.doc(ref, k)); },
        get: function () { return F.getDocs(ref); },
        onSnapshot: function (next, fail) { return F.onSnapshot(ref, next, fail); }
      };
    }
    function item(ref) {
      return {
        collection: function (n) { return coll(F.collection(ref, n)); },
        set: function (v) { return F.setDoc(ref, v); },
        delete: function () { return F.deleteDoc(ref); }
      };
    }
    return { doc: function (p) { return item(F.doc(f.db, p)); }, collection: function (p) { return coll(F.collection(f.db, p)); } };
  }
  // Shaped like window.claude, for the db and user capabilities only. Null when nobody has signed in here.
  function host() {
    if (!available || !read(NAME)) return null;
    return {
      use: function (name) {
        return who().then(function (u) {
          if (!u) return null;
          if (name === 'user') return { id: function () { return Promise.resolve(u.uid); } };
          if (name === 'db') return load().then(database);
          return null;
        });
      }
    };
  }

  // Names are the account's whole identity, so they're kept simple: 2 to 24 letters, numbers, dots, dashes or underscores.
  function cleanName(name) {
    var n = String(name || '').trim().toLowerCase();
    return /^[a-z0-9][a-z0-9._-]{1,23}$/.test(n) ? n : null;
  }
  // An account that already holds progress replaces this browser's copy. A new or empty one takes this browser's progress with it.
  // The page reloads afterwards, so progress.js and decks.js start again with the account.
  function enter(name, password, create) {
    var n = cleanName(name);
    if (!n) return Promise.reject({ code: 'bad-name' });
    return load().then(function (f) {
      var call = create ? f.A.createUserWithEmailAndPassword : f.A.signInWithEmailAndPassword;
      return call(f.auth, n + DOMAIN, password).then(function (cred) {
        var ledger = f.F.collection(f.db, 'data/users/' + cred.user.uid + '/progress/ledger');
        return f.F.getDocs(f.F.query(ledger, f.F.limit(1))).then(function (snap) {
          if (!snap.empty) clearLocal();
          write(NAME, n);
        });
      });
    }).catch(function (e) { throw { code: (e && e.code) || 'unreachable', message: e && e.message }; });
  }
  function leave() {
    return load().then(function (f) {
      return Promise.race([f.F.waitForPendingWrites(f.db), new Promise(function (done) { setTimeout(done, 4000); })])
        .then(function () { return f.A.signOut(f.auth); });
    }).catch(function (e) { console.warn('Signing out:', e && e.message); }).then(function () {
      clearLocal();
      write(NAME, null);
    });
  }
  // What a sign-in error means, for the account screen.
  function problem(code) {
    if (code === 'bad-name') return 'Use 2 to 24 letters or numbers for the name.';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-email') return "That name and password don't match an account.";
    if (code === 'auth/email-already-in-use') return 'That name is taken. Sign in instead, or choose another.';
    if (code === 'auth/weak-password' || code === 'auth/missing-password') return 'Use a password of at least 6 characters.';
    if (code === 'auth/too-many-requests') return 'Too many tries. Wait a minute, then try again.';
    if (code === 'auth/network-request-failed' || code === 'unreachable') return "The account service can't be reached. Check the connection, then try again.";
    return 'That didn\'t work (' + code + '). Try again in a moment.';
  }

  return {
    available: function () { return available; },
    name: function () { return available ? read(NAME) : null; },
    host: host, enter: enter, leave: leave, problem: problem,
    // Proof of who is signed in, for services of our own that should only answer players with an account.
    token: function () { return who().then(function (u) { return u ? u.getIdToken() : null; }); }
  };
})();
