(function(b,a){if((typeof exports)==="object"){a(exports)}else{if(((typeof define)==="function")&&define.amd){define(["exports"],a)}else{a((b.proto={}))}}}(this,function(w){var u,h,k,y;var o,f,p,v,b,l,c,t;u=Object.prototype.isPrototypeOf;h=Object.prototype.hasOwnProperty;k=["configurable","enumerable","value","writable","get","set"];(function(){var A,D,C,B,z;A=["constructor","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","toLocaleString","toString","valueOf"];D={};for(C=(A.length-1);C>=0;C--){D[A[C]]=false}for(B in D){D[B]=true}for(C=(A.length-1);C>=0;C--){if(D[A[C]]){A.splice(C,1)}}z=A.length>0;o=function(H,G){var F,E;for(F in H){if(h.call(H,F)){G(H[F],F)}}if(z){for(E=(A.length-1);E>=0;E--){F=A[E];if(h.call(H,F)){G(H[F],F)}}}}}());(function(){var B,A,z;f=false;if(Object.create){B={x:true};A=Object.create(B,{x:{enumerable:false,value:true}});for(z in A){if(z==="x"){f=true}}}}());function d(B,A){var z;for(z in B){A(B[z],z)}}if(Function.prototype.bind){y=Function.prototype.bind}else{y=function(z){var A;A=this;return function(){return A.apply(z,arguments)}}}function m(){}if(Object.create){p=Object.create}else{p=function(A,z){var B;m.prototype=A;B=new m();if(z){o(z,function(C,D){B[D]=C.value})}return B}}if(Object.preventExtensions){v=Object.preventExtensions}else{v=function(z){}}if(Object.getPrototypeOf){b=Object.getPrototypeOf}else{b=function(z){return z.__proto__}}function r(z,B){var A;do{A=Object.getOwnPropertyDescriptor(z,B);if(A){return A}z=b(z)}while(z)}l=p(Object.prototype);v(l);function s(A){var z;z=p(l);z.method=A;z.wrap=true;return z}function i(A){var z;z=p(l);z.method=A;z.wrap=false;return z}function n(A,z){return function(){var C,B;if(h.call(this,"_super")){C=this._super}else{B=true}this._super=z;try{return A.apply(this,arguments)}finally{if(B){delete this._super}else{this._super=C}}}}c={};v(c);function a(A,z){if(undefined===A){return z}else{return A}}function g(K){var H,F,E,G,J,B;var C,D,I,A,z;K=K||{};H=K.propertyDescriptors;F=a(K.ctorName,"constructor");E=a(K.superWrapAuto,false);G=K.isPublicFn;J=a(K.ctorIsPrivate,Boolean(G));B=a(K.returnInterface,false);C=a(K.defaultConfigurable,true);D=a(K.defaultEnumerable,true);I=a(K.defaultWritable,true);A=a(K.defaultExtensible,true);z=a(K.shadowedEnumerableFix,false);return function(P,M,L,Q){var N,R,S,O;if(undefined===P){P=Object.prototype}if(undefined===L){L=A}N={};if((!Object.getPrototypeOf)&&(!N.__proto__)){N.__proto__={value:P}}if(null!=M){o(M,function(T,W){var X,V,U;if(W==="__proto__"){throw new Error("Invalid member name '"+W+"'")}if(H||((undefined===H)&&(null!=T)&&((typeof T)==="object"))&&!l.isPrototypeOf(T)){if(null==T){X=T}else{X={};for(V=k.length-1;V>=0;V--){U=k[V];if(U in T){X[U]=T[U]}}if(undefined===X.configurable){X.configurable=C}if(undefined===X.writable){if(!(("get" in X)||("set" in X))){X.writable=I}}}}else{X={configurable:C,writable:I,value:T}}if(null!=X){if(undefined===X.enumerable){if(J&&(W===F)){X.enumerable=false}else{if(G){X.enumerable=G(W,X.value)}else{X.enumerable=D}}}if(l.isPrototypeOf(X.value)){if(X.value.wrap){if(null==P){X.value=X.value.method}else{X.value=n(X.value.method,P[W])}}else{X.value=X.value.method}}else{if(E&&(null!=P)&&(W in P)&&((typeof X.value)==="function")){X.value=n(X.value,P[W])}}}N[W]=X})}R=p(P,N);if(B){N={};if(Object.create){d(R,function(T,V){var W,X;if(f&&z){X=r(R,V);if(!X.enumerable){return}}N[V]=W={configurable:false,enumerable:true};if((typeof T)==="function"){W.value=y.call(T,R);W.writable=false}else{W.get=function U(){return R[V]};if(!X){X=r(R,V)}if(X.writable||X.set){W.set=function Y(Z){R[V]=Z}}}});S=p(c,N)}else{d(R,function(T,U){if(((typeof T)==="function")&&(!(J&&(U===F)))&&(U!=="__proto__")&&((G&&G(U,T))||((!G)&&D))){N[U]={value:y.call(T,R)}}});S=p(c,N)}v(S);R.iface=S}if(Q){O=R[F];if((Q.length>0)||((typeof O)==="function")){O.apply(R,Q)}}if(!L){v(R)}if(S){return S}else{return R}}}t=p(Object.prototype,{constructor:{value:function x(){}},hasPrototype:{enumerable:true,value:function q(z){return u.call(z,this)}}});v(t);t.constructor.prototype=t;function e(A,z){if((A===z)||u.call(z,A)){return true}if(!c.isPrototypeOf(A)){return false}if((typeof A.hasPrototype)==="function"){return A.hasPrototype(z)}}function j(A){var C;A=a(A,"constructor");C={};C[A]={value:function(){var D,G,E,F;this._finalizers=[];D=[];G=this;for(;;){G=b(G);if(!G){break}D.push(G)}for(E=D.length-1;E>=0;E--){G=D[E];if(h.call(G,"_deinit")){F=G._deinit;if((typeof F)==="function"){this._onFinalize(F)}}if(h.call(G,"_init")){F=G._init;if((typeof F)==="function"){F.apply(this,arguments)}}}}};C._onFinalize={value:function z(D){this._finalizers.push(D)}};C.finalize={enumerable:true,value:function B(){var E,D;D=this._finalizers;for(E=D.length-1;E>=0;E--){D[E].call(this)}delete this._finalizers}};return C}w.getPrototypeOf=b;w.createObjectFactory=g;w.Interface=c;w.superWrap=s;w.noSuperWrap=i;w.Proto=t;w.isInterfaceOf=e;w.createLifecycleHelperDescriptor=j}));