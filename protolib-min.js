(function(b,a){if((typeof exports)==="object"){a(exports)}else{if(((typeof define)==="function")&&define.amd){define(["exports"],a)}else{a((b.proto={}))}}}(this,function(w){var u,h,k,y;var o,g,p,v,b,l,c,t;u=Object.prototype.isPrototypeOf;h=Object.prototype.hasOwnProperty;k=["configurable","enumerable","value","writable","get","set"];(function(){var A,D,C,B,z;A=["constructor","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","toLocaleString","toString","valueOf"];D={};for(C=(A.length-1);C>=0;C--){D[A[C]]=false}for(B in D){D[B]=true}for(C=(A.length-1);C>=0;C--){if(D[A[C]]){A.splice(C,1)}}z=A.length>0;o=function(H,G){var F,E;for(F in H){if(h.call(H,F)){G(H[F],F)}}if(z){for(E=(A.length-1);E>=0;E--){F=A[E];if(h.call(H,F)){G(H[F],F)}}}}}());(function(){var B,A,z;g=false;if(Object.create){B={x:true};A=Object.create(B,{x:{enumerable:false,value:true}});for(z in A){if(z==="x"){g=true}}}}());function e(B,A){var z;for(z in B){A(B[z],z)}}if(Function.prototype.bind){y=Function.prototype.bind}else{y=function(z){var A;A=this;return function(){return A.apply(z,arguments)}}}function m(){}if(Object.create){p=Object.create}else{p=function(A,z){var B;m.prototype=A;B=new m();if(z){o(z,function(C,D){B[D]=C.value})}return B}}if(Object.preventExtensions){v=Object.preventExtensions}else{v=function(z){}}if(Object.getPrototypeOf){b=Object.getPrototypeOf}else{b=function(z){return z.__proto__}}function r(z,B){var A;do{A=Object.getOwnPropertyDescriptor(z,B);if(A){return A}z=b(z)}while(z)}l=p(Object.prototype);v(l);function s(A){var z;z=p(l);z.method=A;z.wrap=true;return z}function i(A){var z;z=p(l);z.method=A;z.wrap=false;return z}function n(A,z){return function(){var C,B;if(h.call(this,"_super")){C=this._super}else{B=true}this._super=z;try{return A.apply(this,arguments)}finally{if(B){delete this._super}else{this._super=C}}}}c={};v(c);function a(A,z){if(undefined===A){return z}else{return A}}function d(K){var H,F,E,G,J,B;var C,D,I,A,z;K=K||{};H=K.propertyDescriptors;F=a(K.ctorName,"constructor");E=a(K.superWrapAuto,false);G=K.isPublicFn;J=a(K.ctorIsPrivate,Boolean(G));B=a(K.returnInterface,false);C=a(K.defaultConfigurable,true);D=a(K.defaultEnumerable,true);I=a(K.defaultWritable,true);A=a(K.defaultExtensible,true);z=a(K.shadowedEnumerableFix,false);return function(O,M,L,P){var N,Q,R;if(undefined===O){O=Object.prototype}if(undefined===L){L=A}N={};if((!Object.getPrototypeOf)&&(!N.__proto__)){N.__proto__={value:O}}if(null!=M){o(M,function(S,V){var W,U,T;if(V==="__proto__"){throw new Error("Invalid member name '"+V+"'")}if(H||((undefined===H)&&(null!=S)&&((typeof S)==="object"))&&!l.isPrototypeOf(S)){if(null==S){W=S}else{W={};for(U=k.length-1;U>=0;U--){T=k[U];if(T in S){W[T]=S[T]}}if(undefined===W.configurable){W.configurable=C}if(undefined===W.writable){if(!(("get" in W)||("set" in W))){W.writable=I}}}}else{W={configurable:C,writable:I,value:S}}if(null!=W){if(undefined===W.enumerable){if(J&&(V===F)){W.enumerable=false}else{if(G){W.enumerable=G(V,W.value)}else{W.enumerable=D}}}if(l.isPrototypeOf(W.value)){if(W.value.wrap){if(null==O){W.value=W.value.method}else{W.value=n(W.value.method,O[V])}}else{W.value=W.value.method}}else{if(E&&(null!=O)&&(V in O)&&((typeof W.value)==="function")){W.value=n(W.value,O[V])}}}N[V]=W})}Q=p(O,N);if(B){N={};if(Object.create){e(Q,function(S,U){var V,W;if(g&&z){W=r(Q,U);if(!W.enumerable){return}}N[U]=V={configurable:false,enumerable:true};if((typeof S)==="function"){V.value=y.call(S,Q);V.writable=false}else{V.get=function T(){return Q[U]};if(!W){W=r(Q,U)}if(W.writable||W.set){V.set=function X(Y){Q[U]=Y}}}});R=p(c,N)}else{e(Q,function(S,T){if(((typeof S)==="function")&&(!(J&&(T===F)))&&(T!=="__proto__")&&((G&&G(T,S))||((!G)&&D))){N[T]={value:y.call(S,Q)}}});R=p(c,N)}v(R);Q.iface=R}if(P){Q[F].apply(Q,P)}if(!L){v(Q)}if(R){return R}else{return Q}}}t=p(Object.prototype,{constructor:{value:function x(){}},hasPrototype:{enumerable:true,value:function q(z){return u.call(z,this)}}});v(t);t.constructor.prototype=t;function f(A,z){if((A===z)||u.call(z,A)){return true}if(!c.isPrototypeOf(A)){return false}if((typeof A.hasPrototype)==="function"){return A.hasPrototype(z)}}function j(B){var C;B=a(B,"constructor");C={};C[B]={value:function(){var D,G,E,F;this._destroyFns=[];D=[];G=this;for(;;){G=b(G);if(!G){break}D.push(G)}for(E=D.length-1;E>=0;E--){G=D[E];if(h.call(G,"_dispose")){F=G._dispose;if((typeof F)==="function"){this._addDestroyFn(F)}}if(h.call(G,"_init")){F=G._init;if((typeof F)==="function"){F.apply(this,arguments)}}}}};C._addDestroyFn={value:function z(D){this._destroyFns.push(D)}};C.destroy={enumerable:true,value:function A(){var E,D;D=this._destroyFns;for(E=D.length-1;E>=0;E--){D[E].call(this)}delete this._destroyFns}}}w.getPrototypeOf=b;w.createCreate=d;w.Interface=c;w.superWrap=s;w.noSuperWrap=i;w.Proto=t;w.isInterfaceOf=f;w.createLifecycleHelperDescriptor=j}));