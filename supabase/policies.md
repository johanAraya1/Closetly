# Políticas RLS de Closetly

Todas las tablas tienen Row Level Security habilitado. El frontend no debe tomar decisiones finales de permisos.

## users
- SELECT: el usuario puede ver su propio perfil o perfiles públicos.
- UPDATE: solo el usuario puede actualizar su propio registro.
- INSERT: autenticación válida.

## garments
- SELECT: usuario propietario o visibility != 'private'.
- INSERT: solo usuario autenticado puede crear.
- UPDATE/DELETE: solo usuario propietario.

## outfits
- SELECT: usuario propietario o is_public.
- INSERT: usuario autenticado.
- UPDATE/DELETE: solo propietario.

## chats, chat_participants, messages
- SELECT: solo participantes del chat.
- INSERT: participantes autenticados.
- UPDATE: solo autor del mensaje o propietario del chat.
- DELETE: restringido a administradores o chat owner.

## reports
- INSERT: usuario autenticado.
- SELECT: solo roles administrativos.

### Recomendación
Usar funciones de política SQL y autenticación de `auth.uid()` para evitar validaciones en el cliente.
