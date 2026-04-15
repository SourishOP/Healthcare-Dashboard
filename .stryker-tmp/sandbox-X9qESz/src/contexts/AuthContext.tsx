// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
type UserRole = "patient" | "admin";
interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: string | null;
  }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{
    error: string | null;
  }>;
  signInAsAdmin: (email: string, password: string) => Promise<{
    error: string | null;
  }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("1") ? false : (stryCov_9fa48("1"), true));
    const [error, setError] = useState<string | null>(null);
    const fetchRole = async (userId: string): Promise<UserRole> => {
      if (stryMutAct_9fa48("2")) {
        {}
      } else {
        stryCov_9fa48("2");
        try {
          if (stryMutAct_9fa48("3")) {
            {}
          } else {
            stryCov_9fa48("3");
            console.log(stryMutAct_9fa48("4") ? "" : (stryCov_9fa48("4"), "Fetching role for user:"), userId);

            // Add a timeout so this never hangs
            const timeoutPromise = new Promise<{
              data: null;
              error: {
                message: string;
              };
            }>(resolve => {
              if (stryMutAct_9fa48("5")) {
                {}
              } else {
                stryCov_9fa48("5");
                setTimeout(stryMutAct_9fa48("6") ? () => undefined : (stryCov_9fa48("6"), () => resolve(stryMutAct_9fa48("7") ? {} : (stryCov_9fa48("7"), {
                  data: null,
                  error: stryMutAct_9fa48("8") ? {} : (stryCov_9fa48("8"), {
                    message: stryMutAct_9fa48("9") ? "" : (stryCov_9fa48("9"), "Role fetch timed out after 5s")
                  })
                }))), 5000);
              }
            });

            // Fetch ALL roles for the user (they may have both 'patient' and 'admin')
            const queryPromise = supabase.from(stryMutAct_9fa48("10") ? "" : (stryCov_9fa48("10"), "user_roles")).select(stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), "role")).eq(stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), "user_id"), userId);
            const {
              data,
              error
            } = await Promise.race(stryMutAct_9fa48("13") ? [] : (stryCov_9fa48("13"), [queryPromise, timeoutPromise]));
            console.log(stryMutAct_9fa48("14") ? "" : (stryCov_9fa48("14"), "Role query result:"), stryMutAct_9fa48("15") ? {} : (stryCov_9fa48("15"), {
              data,
              error
            }));
            if (stryMutAct_9fa48("17") ? false : stryMutAct_9fa48("16") ? true : (stryCov_9fa48("16", "17"), error)) {
              if (stryMutAct_9fa48("18")) {
                {}
              } else {
                stryCov_9fa48("18");
                console.warn(stryMutAct_9fa48("19") ? "" : (stryCov_9fa48("19"), "Error fetching role (defaulting to patient):"), error);
                return stryMutAct_9fa48("20") ? "" : (stryCov_9fa48("20"), "patient");
              }
            }

            // If user has an 'admin' role, they're an admin (admin takes priority)
            const roles = Array.isArray(data) ? data.map(stryMutAct_9fa48("21") ? () => undefined : (stryCov_9fa48("21"), (r: {
              role: string;
            }) => r.role)) : stryMutAct_9fa48("22") ? ["Stryker was here"] : (stryCov_9fa48("22"), []);
            const role: UserRole = roles.includes(stryMutAct_9fa48("23") ? "" : (stryCov_9fa48("23"), "admin")) ? stryMutAct_9fa48("24") ? "" : (stryCov_9fa48("24"), "admin") : stryMutAct_9fa48("25") ? "" : (stryCov_9fa48("25"), "patient");
            console.log(stryMutAct_9fa48("26") ? "" : (stryCov_9fa48("26"), "User role:"), role, stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), "(all roles:"), roles, stryMutAct_9fa48("28") ? "" : (stryCov_9fa48("28"), ")"));
            return role;
          }
        } catch (err) {
          if (stryMutAct_9fa48("29")) {
            {}
          } else {
            stryCov_9fa48("29");
            console.error(stryMutAct_9fa48("30") ? "" : (stryCov_9fa48("30"), "Error fetching role:"), err);
            return stryMutAct_9fa48("31") ? "" : (stryCov_9fa48("31"), "patient");
          }
        }
      }
    };
    useEffect(() => {
      if (stryMutAct_9fa48("32")) {
        {}
      } else {
        stryCov_9fa48("32");
        let isMounted = stryMutAct_9fa48("33") ? false : (stryCov_9fa48("33"), true);
        const initializeAuth = async () => {
          if (stryMutAct_9fa48("34")) {
            {}
          } else {
            stryCov_9fa48("34");
            try {
              if (stryMutAct_9fa48("35")) {
                {}
              } else {
                stryCov_9fa48("35");
                const {
                  data: {
                    session
                  },
                  error: sessionError
                } = await supabase.auth.getSession();
                if (stryMutAct_9fa48("37") ? false : stryMutAct_9fa48("36") ? true : (stryCov_9fa48("36", "37"), sessionError)) {
                  if (stryMutAct_9fa48("38")) {
                    {}
                  } else {
                    stryCov_9fa48("38");
                    console.error(stryMutAct_9fa48("39") ? "" : (stryCov_9fa48("39"), "Session error:"), sessionError);
                    setError(sessionError.message);
                  }
                }
                if (stryMutAct_9fa48("41") ? false : stryMutAct_9fa48("40") ? true : (stryCov_9fa48("40", "41"), isMounted)) {
                  if (stryMutAct_9fa48("42")) {
                    {}
                  } else {
                    stryCov_9fa48("42");
                    setSession(session);
                    setUser(stryMutAct_9fa48("43") ? session?.user && null : (stryCov_9fa48("43"), (stryMutAct_9fa48("44") ? session.user : (stryCov_9fa48("44"), session?.user)) ?? null));
                    if (stryMutAct_9fa48("47") ? session.user : stryMutAct_9fa48("46") ? false : stryMutAct_9fa48("45") ? true : (stryCov_9fa48("45", "46", "47"), session?.user)) {
                      if (stryMutAct_9fa48("48")) {
                        {}
                      } else {
                        stryCov_9fa48("48");
                        const userRole = await fetchRole(session.user.id);
                        setRole(userRole);
                      }
                    } else {
                      if (stryMutAct_9fa48("49")) {
                        {}
                      } else {
                        stryCov_9fa48("49");
                        setRole(null);
                      }
                    }
                  }
                }
              }
            } catch (err) {
              if (stryMutAct_9fa48("50")) {
                {}
              } else {
                stryCov_9fa48("50");
                console.error(stryMutAct_9fa48("51") ? "" : (stryCov_9fa48("51"), "Auth initialization error:"), err);
                setError(err instanceof Error ? err.message : stryMutAct_9fa48("52") ? "" : (stryCov_9fa48("52"), "Auth initialization failed"));
              }
            } finally {
              if (stryMutAct_9fa48("53")) {
                {}
              } else {
                stryCov_9fa48("53");
                if (stryMutAct_9fa48("55") ? false : stryMutAct_9fa48("54") ? true : (stryCov_9fa48("54", "55"), isMounted)) {
                  if (stryMutAct_9fa48("56")) {
                    {}
                  } else {
                    stryCov_9fa48("56");
                    setLoading(stryMutAct_9fa48("57") ? true : (stryCov_9fa48("57"), false));
                  }
                }
              }
            }
          }
        };
        initializeAuth();
        const {
          data: {
            subscription
          }
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (stryMutAct_9fa48("58")) {
            {}
          } else {
            stryCov_9fa48("58");
            if (stryMutAct_9fa48("60") ? false : stryMutAct_9fa48("59") ? true : (stryCov_9fa48("59", "60"), isMounted)) {
              if (stryMutAct_9fa48("61")) {
                {}
              } else {
                stryCov_9fa48("61");
                setSession(session);
                setUser(stryMutAct_9fa48("62") ? session?.user && null : (stryCov_9fa48("62"), (stryMutAct_9fa48("63") ? session.user : (stryCov_9fa48("63"), session?.user)) ?? null));
                if (stryMutAct_9fa48("66") ? session.user : stryMutAct_9fa48("65") ? false : stryMutAct_9fa48("64") ? true : (stryCov_9fa48("64", "65", "66"), session?.user)) {
                  if (stryMutAct_9fa48("67")) {
                    {}
                  } else {
                    stryCov_9fa48("67");
                    const userRole = await fetchRole(session.user.id);
                    setRole(userRole);
                  }
                } else {
                  if (stryMutAct_9fa48("68")) {
                    {}
                  } else {
                    stryCov_9fa48("68");
                    setRole(null);
                  }
                }
                setLoading(stryMutAct_9fa48("69") ? true : (stryCov_9fa48("69"), false));
              }
            }
          }
        });
        return () => {
          if (stryMutAct_9fa48("70")) {
            {}
          } else {
            stryCov_9fa48("70");
            isMounted = stryMutAct_9fa48("71") ? true : (stryCov_9fa48("71"), false);
            subscription.unsubscribe();
          }
        };
      }
    }, stryMutAct_9fa48("72") ? ["Stryker was here"] : (stryCov_9fa48("72"), []));
    const signIn = async (email: string, password: string) => {
      if (stryMutAct_9fa48("73")) {
        {}
      } else {
        stryCov_9fa48("73");
        try {
          if (stryMutAct_9fa48("74")) {
            {}
          } else {
            stryCov_9fa48("74");
            console.log(stryMutAct_9fa48("75") ? "" : (stryCov_9fa48("75"), "signIn called with:"), email);
            const result = await supabase.auth.signInWithPassword(stryMutAct_9fa48("76") ? {} : (stryCov_9fa48("76"), {
              email,
              password
            }));
            console.log(stryMutAct_9fa48("77") ? "" : (stryCov_9fa48("77"), "Full signInWithPassword result:"), JSON.stringify(result, null, 2));
            if (stryMutAct_9fa48("79") ? false : stryMutAct_9fa48("78") ? true : (stryCov_9fa48("78", "79"), result.error)) {
              if (stryMutAct_9fa48("80")) {
                {}
              } else {
                stryCov_9fa48("80");
                console.error(stryMutAct_9fa48("81") ? "" : (stryCov_9fa48("81"), "Supabase signIn error:"), result.error.message);
                return stryMutAct_9fa48("82") ? {} : (stryCov_9fa48("82"), {
                  error: result.error.message
                });
              }
            }

            // Manually update state after successful login
            if (stryMutAct_9fa48("85") ? result.data.session || result.data.user : stryMutAct_9fa48("84") ? false : stryMutAct_9fa48("83") ? true : (stryCov_9fa48("83", "84", "85"), result.data.session && result.data.user)) {
              if (stryMutAct_9fa48("86")) {
                {}
              } else {
                stryCov_9fa48("86");
                console.log(stryMutAct_9fa48("87") ? "" : (stryCov_9fa48("87"), "Sign in successful, updating state:"), result.data.user.email);
                setSession(result.data.session);
                setUser(result.data.user);

                // Fetch and set role
                const userRole = await fetchRole(result.data.user.id);
                setRole(userRole);
                setLoading(stryMutAct_9fa48("88") ? true : (stryCov_9fa48("88"), false));
              }
            }
            return stryMutAct_9fa48("89") ? {} : (stryCov_9fa48("89"), {
              error: null
            });
          }
        } catch (err) {
          if (stryMutAct_9fa48("90")) {
            {}
          } else {
            stryCov_9fa48("90");
            const errorMsg = err instanceof Error ? err.message : stryMutAct_9fa48("91") ? "" : (stryCov_9fa48("91"), "SignIn failed");
            console.error(stryMutAct_9fa48("92") ? "" : (stryCov_9fa48("92"), "SignIn caught exception:"), errorMsg);
            return stryMutAct_9fa48("93") ? {} : (stryCov_9fa48("93"), {
              error: errorMsg
            });
          }
        }
      }
    };
    const signUp = async (email: string, password: string, fullName: string) => {
      if (stryMutAct_9fa48("94")) {
        {}
      } else {
        stryCov_9fa48("94");
        const {
          error
        } = await supabase.auth.signUp(stryMutAct_9fa48("95") ? {} : (stryCov_9fa48("95"), {
          email,
          password,
          options: stryMutAct_9fa48("96") ? {} : (stryCov_9fa48("96"), {
            data: stryMutAct_9fa48("97") ? {} : (stryCov_9fa48("97"), {
              full_name: fullName
            }),
            emailRedirectTo: window.location.origin
          })
        }));
        return stryMutAct_9fa48("98") ? {} : (stryCov_9fa48("98"), {
          error: stryMutAct_9fa48("101") ? error?.message && null : stryMutAct_9fa48("100") ? false : stryMutAct_9fa48("99") ? true : (stryCov_9fa48("99", "100", "101"), (stryMutAct_9fa48("102") ? error.message : (stryCov_9fa48("102"), error?.message)) || null)
        });
      }
    };
    const signInAsAdmin = async (email: string, password: string) => {
      if (stryMutAct_9fa48("103")) {
        {}
      } else {
        stryCov_9fa48("103");
        try {
          if (stryMutAct_9fa48("104")) {
            {}
          } else {
            stryCov_9fa48("104");
            // First, try to sign in
            const result = await supabase.auth.signInWithPassword(stryMutAct_9fa48("105") ? {} : (stryCov_9fa48("105"), {
              email,
              password
            }));
            if (stryMutAct_9fa48("107") ? false : stryMutAct_9fa48("106") ? true : (stryCov_9fa48("106", "107"), result.error)) return stryMutAct_9fa48("108") ? {} : (stryCov_9fa48("108"), {
              error: result.error.message
            });
            if (stryMutAct_9fa48("111") ? false : stryMutAct_9fa48("110") ? true : stryMutAct_9fa48("109") ? result.data.session?.user : (stryCov_9fa48("109", "110", "111"), !(stryMutAct_9fa48("112") ? result.data.session.user : (stryCov_9fa48("112"), result.data.session?.user)))) return stryMutAct_9fa48("113") ? {} : (stryCov_9fa48("113"), {
              error: stryMutAct_9fa48("114") ? "" : (stryCov_9fa48("114"), "Failed to retrieve session")
            });

            // Use the same fetchRole function that already works
            const userRole = await fetchRole(result.data.session.user.id);
            console.log(stryMutAct_9fa48("115") ? "" : (stryCov_9fa48("115"), "signInAsAdmin - fetched role:"), userRole);
            if (stryMutAct_9fa48("118") ? userRole === "admin" : stryMutAct_9fa48("117") ? false : stryMutAct_9fa48("116") ? true : (stryCov_9fa48("116", "117", "118"), userRole !== (stryMutAct_9fa48("119") ? "" : (stryCov_9fa48("119"), "admin")))) {
              if (stryMutAct_9fa48("120")) {
                {}
              } else {
                stryCov_9fa48("120");
                // Not an admin, sign them out immediately
                await supabase.auth.signOut();
                return stryMutAct_9fa48("121") ? {} : (stryCov_9fa48("121"), {
                  error: stryMutAct_9fa48("122") ? "" : (stryCov_9fa48("122"), "Access denied. This account does not have admin privileges.")
                });
              }
            }

            // Manually update state after successful admin login
            console.log(stryMutAct_9fa48("123") ? "" : (stryCov_9fa48("123"), "Admin sign in successful:"), stryMutAct_9fa48("124") ? result.data.user.email : (stryCov_9fa48("124"), result.data.user?.email));
            setSession(result.data.session);
            setUser(result.data.user);
            setRole(stryMutAct_9fa48("125") ? "" : (stryCov_9fa48("125"), "admin"));
            setLoading(stryMutAct_9fa48("126") ? true : (stryCov_9fa48("126"), false));
            return stryMutAct_9fa48("127") ? {} : (stryCov_9fa48("127"), {
              error: null
            });
          }
        } catch (err) {
          if (stryMutAct_9fa48("128")) {
            {}
          } else {
            stryCov_9fa48("128");
            const errorMsg = err instanceof Error ? err.message : stryMutAct_9fa48("129") ? "" : (stryCov_9fa48("129"), "Admin sign in failed");
            console.error(stryMutAct_9fa48("130") ? "" : (stryCov_9fa48("130"), "Admin SignIn exception:"), errorMsg);
            return stryMutAct_9fa48("131") ? {} : (stryCov_9fa48("131"), {
              error: errorMsg
            });
          }
        }
      }
    };
    const signOut = async () => {
      if (stryMutAct_9fa48("132")) {
        {}
      } else {
        stryCov_9fa48("132");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setRole(null);
      }
    };
    return <AuthContext.Provider value={stryMutAct_9fa48("133") ? {} : (stryCov_9fa48("133"), {
      session,
      user,
      role,
      loading,
      signIn,
      signUp,
      signInAsAdmin,
      signOut,
      isAdmin: stryMutAct_9fa48("136") ? role !== "admin" : stryMutAct_9fa48("135") ? false : stryMutAct_9fa48("134") ? true : (stryCov_9fa48("134", "135", "136"), role === (stryMutAct_9fa48("137") ? "" : (stryCov_9fa48("137"), "admin")))
    })}>
      {children}
    </AuthContext.Provider>;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  if (stryMutAct_9fa48("138")) {
    {}
  } else {
    stryCov_9fa48("138");
    const context = useContext(AuthContext);
    if (stryMutAct_9fa48("141") ? false : stryMutAct_9fa48("140") ? true : stryMutAct_9fa48("139") ? context : (stryCov_9fa48("139", "140", "141"), !context)) throw new Error(stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), "useAuth must be used within AuthProvider"));
    return context;
  }
}