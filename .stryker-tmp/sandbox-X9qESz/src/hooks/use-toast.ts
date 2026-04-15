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
import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST"
} as const;
let count = 0;
function genId() {
  if (stryMutAct_9fa48("143")) {
    {}
  } else {
    stryCov_9fa48("143");
    count = stryMutAct_9fa48("144") ? (count + 1) * Number.MAX_SAFE_INTEGER : (stryCov_9fa48("144"), (stryMutAct_9fa48("145") ? count - 1 : (stryCov_9fa48("145"), count + 1)) % Number.MAX_SAFE_INTEGER);
    return count.toString();
  }
}
type ActionType = typeof actionTypes;
type Action = {
  type: ActionType["ADD_TOAST"];
  toast: ToasterToast;
} | {
  type: ActionType["UPDATE_TOAST"];
  toast: Partial<ToasterToast>;
} | {
  type: ActionType["DISMISS_TOAST"];
  toastId?: ToasterToast["id"];
} | {
  type: ActionType["REMOVE_TOAST"];
  toastId?: ToasterToast["id"];
};
interface State {
  toasts: ToasterToast[];
}
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const addToRemoveQueue = (toastId: string) => {
  if (stryMutAct_9fa48("146")) {
    {}
  } else {
    stryCov_9fa48("146");
    if (stryMutAct_9fa48("148") ? false : stryMutAct_9fa48("147") ? true : (stryCov_9fa48("147", "148"), toastTimeouts.has(toastId))) {
      if (stryMutAct_9fa48("149")) {
        {}
      } else {
        stryCov_9fa48("149");
        return;
      }
    }
    const timeout = setTimeout(() => {
      if (stryMutAct_9fa48("150")) {
        {}
      } else {
        stryCov_9fa48("150");
        toastTimeouts.delete(toastId);
        dispatch(stryMutAct_9fa48("151") ? {} : (stryCov_9fa48("151"), {
          type: stryMutAct_9fa48("152") ? "" : (stryCov_9fa48("152"), "REMOVE_TOAST"),
          toastId: toastId
        }));
      }
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
  }
};
export const reducer = (state: State, action: Action): State => {
  if (stryMutAct_9fa48("153")) {
    {}
  } else {
    stryCov_9fa48("153");
    switch (action.type) {
      case stryMutAct_9fa48("155") ? "" : (stryCov_9fa48("155"), "ADD_TOAST"):
        if (stryMutAct_9fa48("154")) {} else {
          stryCov_9fa48("154");
          return stryMutAct_9fa48("156") ? {} : (stryCov_9fa48("156"), {
            ...state,
            toasts: stryMutAct_9fa48("157") ? [action.toast, ...state.toasts] : (stryCov_9fa48("157"), (stryMutAct_9fa48("158") ? [] : (stryCov_9fa48("158"), [action.toast, ...state.toasts])).slice(0, TOAST_LIMIT))
          });
        }
      case stryMutAct_9fa48("160") ? "" : (stryCov_9fa48("160"), "UPDATE_TOAST"):
        if (stryMutAct_9fa48("159")) {} else {
          stryCov_9fa48("159");
          return stryMutAct_9fa48("161") ? {} : (stryCov_9fa48("161"), {
            ...state,
            toasts: state.toasts.map(stryMutAct_9fa48("162") ? () => undefined : (stryCov_9fa48("162"), t => (stryMutAct_9fa48("165") ? t.id !== action.toast.id : stryMutAct_9fa48("164") ? false : stryMutAct_9fa48("163") ? true : (stryCov_9fa48("163", "164", "165"), t.id === action.toast.id)) ? stryMutAct_9fa48("166") ? {} : (stryCov_9fa48("166"), {
              ...t,
              ...action.toast
            }) : t))
          });
        }
      case stryMutAct_9fa48("168") ? "" : (stryCov_9fa48("168"), "DISMISS_TOAST"):
        if (stryMutAct_9fa48("167")) {} else {
          stryCov_9fa48("167");
          {
            if (stryMutAct_9fa48("169")) {
              {}
            } else {
              stryCov_9fa48("169");
              const {
                toastId
              } = action;

              // ! Side effects ! - This could be extracted into a dismissToast() action,
              // but I'll keep it here for simplicity
              if (stryMutAct_9fa48("171") ? false : stryMutAct_9fa48("170") ? true : (stryCov_9fa48("170", "171"), toastId)) {
                if (stryMutAct_9fa48("172")) {
                  {}
                } else {
                  stryCov_9fa48("172");
                  addToRemoveQueue(toastId);
                }
              } else {
                if (stryMutAct_9fa48("173")) {
                  {}
                } else {
                  stryCov_9fa48("173");
                  state.toasts.forEach(toast => {
                    if (stryMutAct_9fa48("174")) {
                      {}
                    } else {
                      stryCov_9fa48("174");
                      addToRemoveQueue(toast.id);
                    }
                  });
                }
              }
              return stryMutAct_9fa48("175") ? {} : (stryCov_9fa48("175"), {
                ...state,
                toasts: state.toasts.map(stryMutAct_9fa48("176") ? () => undefined : (stryCov_9fa48("176"), t => (stryMutAct_9fa48("179") ? t.id === toastId && toastId === undefined : stryMutAct_9fa48("178") ? false : stryMutAct_9fa48("177") ? true : (stryCov_9fa48("177", "178", "179"), (stryMutAct_9fa48("181") ? t.id !== toastId : stryMutAct_9fa48("180") ? false : (stryCov_9fa48("180", "181"), t.id === toastId)) || (stryMutAct_9fa48("183") ? toastId !== undefined : stryMutAct_9fa48("182") ? false : (stryCov_9fa48("182", "183"), toastId === undefined)))) ? stryMutAct_9fa48("184") ? {} : (stryCov_9fa48("184"), {
                  ...t,
                  open: stryMutAct_9fa48("185") ? true : (stryCov_9fa48("185"), false)
                }) : t))
              });
            }
          }
        }
      case stryMutAct_9fa48("187") ? "" : (stryCov_9fa48("187"), "REMOVE_TOAST"):
        if (stryMutAct_9fa48("186")) {} else {
          stryCov_9fa48("186");
          if (stryMutAct_9fa48("190") ? action.toastId !== undefined : stryMutAct_9fa48("189") ? false : stryMutAct_9fa48("188") ? true : (stryCov_9fa48("188", "189", "190"), action.toastId === undefined)) {
            if (stryMutAct_9fa48("191")) {
              {}
            } else {
              stryCov_9fa48("191");
              return stryMutAct_9fa48("192") ? {} : (stryCov_9fa48("192"), {
                ...state,
                toasts: stryMutAct_9fa48("193") ? ["Stryker was here"] : (stryCov_9fa48("193"), [])
              });
            }
          }
          return stryMutAct_9fa48("194") ? {} : (stryCov_9fa48("194"), {
            ...state,
            toasts: stryMutAct_9fa48("195") ? state.toasts : (stryCov_9fa48("195"), state.toasts.filter(stryMutAct_9fa48("196") ? () => undefined : (stryCov_9fa48("196"), t => stryMutAct_9fa48("199") ? t.id === action.toastId : stryMutAct_9fa48("198") ? false : stryMutAct_9fa48("197") ? true : (stryCov_9fa48("197", "198", "199"), t.id !== action.toastId))))
          });
        }
    }
  }
};
const listeners: Array<(state: State) => void> = stryMutAct_9fa48("200") ? ["Stryker was here"] : (stryCov_9fa48("200"), []);
let memoryState: State = stryMutAct_9fa48("201") ? {} : (stryCov_9fa48("201"), {
  toasts: stryMutAct_9fa48("202") ? ["Stryker was here"] : (stryCov_9fa48("202"), [])
});
function dispatch(action: Action) {
  if (stryMutAct_9fa48("203")) {
    {}
  } else {
    stryCov_9fa48("203");
    memoryState = reducer(memoryState, action);
    listeners.forEach(listener => {
      if (stryMutAct_9fa48("204")) {
        {}
      } else {
        stryCov_9fa48("204");
        listener(memoryState);
      }
    });
  }
}
type Toast = Omit<ToasterToast, "id">;
function toast({
  ...props
}: Toast) {
  if (stryMutAct_9fa48("205")) {
    {}
  } else {
    stryCov_9fa48("205");
    const id = genId();
    const update = stryMutAct_9fa48("206") ? () => undefined : (stryCov_9fa48("206"), (() => {
      const update = (props: ToasterToast) => dispatch(stryMutAct_9fa48("207") ? {} : (stryCov_9fa48("207"), {
        type: stryMutAct_9fa48("208") ? "" : (stryCov_9fa48("208"), "UPDATE_TOAST"),
        toast: stryMutAct_9fa48("209") ? {} : (stryCov_9fa48("209"), {
          ...props,
          id
        })
      }));
      return update;
    })());
    const dismiss = stryMutAct_9fa48("210") ? () => undefined : (stryCov_9fa48("210"), (() => {
      const dismiss = () => dispatch(stryMutAct_9fa48("211") ? {} : (stryCov_9fa48("211"), {
        type: stryMutAct_9fa48("212") ? "" : (stryCov_9fa48("212"), "DISMISS_TOAST"),
        toastId: id
      }));
      return dismiss;
    })());
    dispatch(stryMutAct_9fa48("213") ? {} : (stryCov_9fa48("213"), {
      type: stryMutAct_9fa48("214") ? "" : (stryCov_9fa48("214"), "ADD_TOAST"),
      toast: stryMutAct_9fa48("215") ? {} : (stryCov_9fa48("215"), {
        ...props,
        id,
        open: stryMutAct_9fa48("216") ? false : (stryCov_9fa48("216"), true),
        onOpenChange: open => {
          if (stryMutAct_9fa48("217")) {
            {}
          } else {
            stryCov_9fa48("217");
            if (stryMutAct_9fa48("220") ? false : stryMutAct_9fa48("219") ? true : stryMutAct_9fa48("218") ? open : (stryCov_9fa48("218", "219", "220"), !open)) dismiss();
          }
        }
      })
    }));
    return stryMutAct_9fa48("221") ? {} : (stryCov_9fa48("221"), {
      id: id,
      dismiss,
      update
    });
  }
}
function useToast() {
  if (stryMutAct_9fa48("222")) {
    {}
  } else {
    stryCov_9fa48("222");
    const [state, setState] = React.useState<State>(memoryState);
    React.useEffect(() => {
      if (stryMutAct_9fa48("223")) {
        {}
      } else {
        stryCov_9fa48("223");
        listeners.push(setState);
        return () => {
          if (stryMutAct_9fa48("224")) {
            {}
          } else {
            stryCov_9fa48("224");
            const index = listeners.indexOf(setState);
            if (stryMutAct_9fa48("228") ? index <= -1 : stryMutAct_9fa48("227") ? index >= -1 : stryMutAct_9fa48("226") ? false : stryMutAct_9fa48("225") ? true : (stryCov_9fa48("225", "226", "227", "228"), index > (stryMutAct_9fa48("229") ? +1 : (stryCov_9fa48("229"), -1)))) {
              if (stryMutAct_9fa48("230")) {
                {}
              } else {
                stryCov_9fa48("230");
                listeners.splice(index, 1);
              }
            }
          }
        };
      }
    }, stryMutAct_9fa48("231") ? [] : (stryCov_9fa48("231"), [state]));
    return stryMutAct_9fa48("232") ? {} : (stryCov_9fa48("232"), {
      ...state,
      toast,
      dismiss: stryMutAct_9fa48("233") ? () => undefined : (stryCov_9fa48("233"), (toastId?: string) => dispatch(stryMutAct_9fa48("234") ? {} : (stryCov_9fa48("234"), {
        type: stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), "DISMISS_TOAST"),
        toastId
      })))
    });
  }
}
export { useToast, toast };