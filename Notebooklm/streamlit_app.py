"""Streamlit app for NotebookLM infographic generation."""

import asyncio
import tempfile
from pathlib import Path

import streamlit as st

from notebooklm import (
    InfographicDetail,
    InfographicOrientation,
    InfographicStyle,
    NotebookLMClient,
    SlideDeckFormat,
    SlideDeckLength,
)
from notebooklm.cli.language import SUPPORTED_LANGUAGES
from notebooklm.rpc import RPCMethod, build_request_body, encode_rpc_request


@st.cache_resource
def get_auth():
    """Get auth tokens from storage (cached)."""
    from notebooklm import AuthTokens

    try:
        return asyncio.run(AuthTokens.from_storage())
    except Exception:
        return None


async def async_list_notebooks(auth):
    """List notebooks."""
    async with NotebookLMClient(auth) as client:
        return await client.notebooks.list()


async def async_create_notebook(auth, title):
    """Create a notebook."""
    async with NotebookLMClient(auth) as client:
        return await client.notebooks.create(title)


async def async_add_file_source(auth, notebook_id, file_path, mime_type):
    """Add file source to notebook."""
    async with NotebookLMClient(auth) as client:
        return await client.sources.add_file(
            notebook_id,
            file_path,
            mime_type=mime_type,
            wait=True,
            wait_timeout=120.0,
        )


async def async_add_url_source(auth, notebook_id, url):
    """Add URL source to notebook."""
    async with NotebookLMClient(auth) as client:
        return await client.sources.add_url(
            notebook_id,
            url,
            wait=True,
            wait_timeout=120.0,
        )


async def async_start_infographic_generation(
    auth, notebook_id, source_ids, orientation, detail, language, instructions, style
):
    """Start infographic generation."""
    async with NotebookLMClient(auth) as client:
        return await client.artifacts.generate_infographic(
            notebook_id,
            source_ids=source_ids,
            orientation=orientation,
            detail_level=detail,
            language=language,
            instructions=instructions,
            style=style,
        )


async def async_set_output_language(auth, language):
    """Set NotebookLM global output language."""
    async with NotebookLMClient(auth) as client:
        return await client.settings.set_output_language(language)


async def async_poll_infographic_status(auth, notebook_id, task_id):
    """Poll infographic generation status."""
    async with NotebookLMClient(auth) as client:
        return await client.artifacts.poll_status(notebook_id, task_id)


async def async_start_slide_deck_generation(
    auth, notebook_id, source_ids, language, instructions, slide_format, slide_length
):
    """Start slide deck generation."""
    async with NotebookLMClient(auth) as client:
        return await client.artifacts.generate_slide_deck(
            notebook_id,
            source_ids=source_ids,
            language=language,
            instructions=instructions,
            slide_format=slide_format,
            slide_length=slide_length,
        )


async def async_poll_slide_deck_status(auth, notebook_id, task_id):
    """Poll slide deck generation status."""
    async with NotebookLMClient(auth) as client:
        return await client.artifacts.poll_status(notebook_id, task_id)


async def async_delete_source(auth, notebook_id, source_id):
    """Delete a source from notebook."""
    async with NotebookLMClient(auth) as client:
        return await client.sources.delete(notebook_id, source_id)


async def async_list_sources(auth, notebook_id):
    """List sources in a notebook."""
    async with NotebookLMClient(auth) as client:
        return await client.sources.list(notebook_id)


async def async_download_infographic(auth, notebook_id, output_path, artifact_id=None):
    """Download infographic."""
    async with NotebookLMClient(auth) as client:
        return await client.artifacts.download_infographic(
            notebook_id,
            output_path,
            artifact_id=artifact_id,
        )


async def async_download_slide_deck(
    auth, notebook_id, output_path, artifact_id=None, output_format="pdf"
):
    """Download slide deck."""
    async with NotebookLMClient(auth) as client:
        return await client.artifacts.download_slide_deck(
            notebook_id,
            output_path,
            artifact_id=artifact_id,
            output_format=output_format,
        )


def get_mime_type(filename: str) -> str:
    """Guess MIME type from file extension."""
    ext = Path(filename).suffix.lower()
    mime_map = {
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".md": "text/markdown",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".epub": "application/epub+zip",
    }
    return mime_map.get(ext, "application/octet-stream")


def orientation_to_enum(value):
    """Convert string to InfographicOrientation enum."""
    mapping = {
        "landscape": InfographicOrientation.LANDSCAPE,
        "portrait": InfographicOrientation.PORTRAIT,
        "square": InfographicOrientation.SQUARE,
    }
    return mapping.get(value, InfographicOrientation.LANDSCAPE)


def detail_to_enum(value):
    """Convert string to InfographicDetail enum."""
    mapping = {
        "concise": InfographicDetail.CONCISE,
        "standard": InfographicDetail.STANDARD,
        "detailed": InfographicDetail.DETAILED,
    }
    return mapping.get(value, InfographicDetail.STANDARD)


def style_to_enum(value):
    """Convert string to InfographicStyle enum."""
    mapping = {
        "auto": InfographicStyle.AUTO_SELECT,
        "sketch-note": InfographicStyle.SKETCH_NOTE,
        "professional": InfographicStyle.PROFESSIONAL,
        "bento-grid": InfographicStyle.BENTO_GRID,
        "editorial": InfographicStyle.EDITORIAL,
        "instructional": InfographicStyle.INSTRUCTIONAL,
        "bricks": InfographicStyle.BRICKS,
        "clay": InfographicStyle.CLAY,
        "anime": InfographicStyle.ANIME,
        "kawaii": InfographicStyle.KAWAII,
        "scientific": InfographicStyle.SCIENTIFIC,
    }
    return mapping.get(value)


def slide_format_to_enum(value):
    """Convert string to SlideDeckFormat enum."""
    mapping = {
        "detailed": SlideDeckFormat.DETAILED_DECK,
        "presenter": SlideDeckFormat.PRESENTER_SLIDES,
    }
    return mapping.get(value, SlideDeckFormat.DETAILED_DECK)


def slide_length_to_enum(value):
    """Convert string to SlideDeckLength enum."""
    mapping = {
        "default": SlideDeckLength.DEFAULT,
        "short": SlideDeckLength.SHORT,
    }
    return mapping.get(value, SlideDeckLength.DEFAULT)


def _source_ids_triple(source_ids):
    return [[[sid]] for sid in source_ids] if source_ids else []


def build_infographic_params(source_ids, language, instructions, orientation, detail, style):
    """Build raw infographic CREATE_ARTIFACT params for debugging."""
    orientation_code = orientation.value if orientation else None
    detail_code = detail.value if detail else None
    style_code = style.value if style else None
    return [
        [2],
        "<notebook_id>",
        [
            None,
            None,
            7,
            _source_ids_triple(source_ids),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            [[instructions, language, None, orientation_code, detail_code, style_code]],
        ],
    ]


def build_slide_deck_params(source_ids, language, instructions, slide_format, slide_length):
    """Build raw slide deck CREATE_ARTIFACT params for debugging."""
    format_code = slide_format.value if slide_format else None
    length_code = slide_length.value if slide_length else None
    return [
        [2],
        "<notebook_id>",
        [
            None,
            None,
            8,
            _source_ids_triple(source_ids),
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            [[instructions, language, format_code, length_code]],
        ],
    ]


def build_debug_request_preview(method, params):
    """Return encoded RPC preview for debugging."""
    rpc_request = encode_rpc_request(method, params)
    request_body = build_request_body(rpc_request, csrf_token="REDACTED")
    return {
        "method": method.value,
        "params": params,
        "rpc_request": rpc_request,
        "body_preview": request_body,
    }


LANGUAGE_OPTIONS = {
    "Português (Brasil)": "pt_BR",
    "English": "en",
    "Español": "es",
    "Français": "fr",
    "Deutsch": "de",
}


def main():
    st.set_page_config(
        page_title="NotebookLM Infographic Generator",
        page_icon=":bar_chart:",
        layout="wide",
    )

    st.title("NotebookLM Infographic Generator")

    if "notebook_id" not in st.session_state:
        st.session_state.notebook_id = None
    if "uploaded_file_path" not in st.session_state:
        st.session_state.uploaded_file_path = None
    if "infographic_ready" not in st.session_state:
        st.session_state.infographic_ready = False
    if "infographic_path" not in st.session_state:
        st.session_state.infographic_path = None
    if "infographic_task_id" not in st.session_state:
        st.session_state.infographic_task_id = None
    if "infographic_status" not in st.session_state:
        st.session_state.infographic_status = None
    if "slide_ready" not in st.session_state:
        st.session_state.slide_ready = False
    if "slide_path" not in st.session_state:
        st.session_state.slide_path = None
    if "slide_task_id" not in st.session_state:
        st.session_state.slide_task_id = None
    if "slide_status" not in st.session_state:
        st.session_state.slide_status = None

    auth = get_auth()
    if auth is None:
        st.error("Nao autenticado. Execute 'notebooklm login' primeiro.")
        st.stop()

    current_sources = []
    previous_notebook_id = st.session_state.notebook_id

    with st.sidebar:
        st.header("Configuracao")
        st.success("Autenticado")

        st.subheader("Notebook")
        try:
            notebooks = asyncio.run(async_list_notebooks(auth))
        except Exception as e:
            st.error(f"Erro ao listar notebooks: {e}")
            notebooks = []

        notebook_options = {nb.id: nb.title for nb in notebooks}
        notebook_options["__create_new__"] = "+ Criar novo notebook..."

        selected = st.selectbox(
            "Selecione ou crie um notebook:",
            options=list(notebook_options.keys()),
            format_func=lambda x: notebook_options[x],
            key="notebook_select",
        )

        if selected == "__create_new__":
            new_title = st.text_input("Nome do novo notebook:", value="Infographic Generator")
            if st.button("Criar"):
                with st.spinner("Criando notebook..."):
                    try:
                        nb = asyncio.run(async_create_notebook(auth, new_title))
                        st.session_state.notebook_id = nb.id
                        st.success(f"Notebook '{nb.title}' criado.")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Erro: {e}")
        else:
            if previous_notebook_id != selected:
                st.session_state.infographic_ready = False
                st.session_state.infographic_path = None
                st.session_state.infographic_task_id = None
                st.session_state.infographic_status = None
                st.session_state.slide_ready = False
                st.session_state.slide_path = None
                st.session_state.slide_task_id = None
                st.session_state.slide_status = None
            st.session_state.notebook_id = selected
            st.info(f"Notebook: {notebook_options[selected]}")

        st.subheader("Gerenciar Fontes")
        if st.session_state.notebook_id:
            try:
                current_sources = asyncio.run(
                    async_list_sources(auth, st.session_state.notebook_id)
                )
                source_options = {src.id: (src.title or "Sem titulo") for src in current_sources}

                if source_options:
                    selected_source = st.selectbox(
                        "Selecione a fonte:",
                        options=list(source_options.keys()),
                        format_func=lambda x: source_options[x],
                        key="source_delete_select",
                    )
                    if st.button("Remover Fonte", type="secondary"):
                        with st.spinner("Removendo fonte..."):
                            try:
                                asyncio.run(
                                    async_delete_source(
                                        auth,
                                        st.session_state.notebook_id,
                                        selected_source,
                                    )
                                )
                                st.success("Fonte removida.")
                                st.session_state.infographic_task_id = None
                                st.session_state.infographic_status = None
                                st.session_state.infographic_ready = False
                                st.session_state.infographic_path = None
                                st.session_state.slide_task_id = None
                                st.session_state.slide_status = None
                                st.session_state.slide_ready = False
                                st.session_state.slide_path = None
                                st.rerun()
                            except Exception as e:
                                st.error(f"Erro ao remover: {e}")
                else:
                    st.info("Nenhuma fonte neste notebook.")
            except Exception as e:
                st.error(f"Erro ao listar fontes: {e}")
        else:
            st.info("Selecione um notebook primeiro.")

        st.subheader("Opcoes do Infografico")
        orientation = st.selectbox(
            "Orientacao:",
            options=["landscape", "portrait", "square"],
            index=0,
            key="orientation_select",
        )
        detail = st.selectbox(
            "Nivel de detalhe:",
            options=["concise", "standard", "detailed"],
            index=1,
            key="detail_select",
        )
        style = st.selectbox(
            "Estilo visual:",
            options=[
                "auto",
                "sketch-note",
                "professional",
                "bento-grid",
                "editorial",
                "instructional",
                "bricks",
                "clay",
                "anime",
                "kawaii",
                "scientific",
            ],
            index=0,
            key="style_select",
        )
        st.subheader("Opcoes da Apresentacao")
        slide_format = st.selectbox(
            "Formato dos slides:",
            options=["detailed", "presenter"],
            index=0,
            key="slide_format_select",
        )
        slide_length = st.selectbox(
            "Comprimento da apresentacao:",
            options=["default", "short"],
            index=0,
            key="slide_length_select",
        )
        slide_download_format = st.selectbox(
            "Formato de download:",
            options=["pdf", "pptx"],
            index=0,
            key="slide_download_format_select",
        )

    if not st.session_state.notebook_id:
        st.warning("Selecione ou crie um notebook na barra lateral.")
        st.stop()

    has_sources = len(current_sources) > 0

    st.header("Fontes")
    uploaded_file = st.file_uploader(
        "Arraste ou selecione um arquivo",
        type=["pdf", "txt", "md", "docx", "epub"],
        help="PDF, texto, markdown, Word ou EPUB",
    )

    if uploaded_file:
        col1, _ = st.columns([1, 2])
        with col1:
            st.write(f"**Arquivo:** {uploaded_file.name}")
            st.write(f"**Tamanho:** {uploaded_file.size / 1024:.1f} KB")
            st.write(f"**Tipo:** {uploaded_file.type}")

            if st.button("Adicionar Arquivo ao Notebook", type="primary"):
                with st.spinner("Enviando arquivo para o NotebookLM..."):
                    try:
                        suffix = Path(uploaded_file.name).suffix
                        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                            tmp_file.write(uploaded_file.getvalue())
                            tmp_path = Path(tmp_file.name)

                        mime_type = get_mime_type(uploaded_file.name)
                        source = asyncio.run(
                            async_add_file_source(
                                auth,
                                st.session_state.notebook_id,
                                tmp_path,
                                mime_type,
                            )
                        )
                        st.session_state.uploaded_file_path = tmp_path
                        st.success(f"Arquivo adicionado: {source.title}")
                        st.rerun()
                    except Exception as e:
                        st.error(f"Erro ao adicionar arquivo: {e}")

    st.divider()

    st.subheader("Adicionar URL")
    url_input = st.text_area(
        "Cole uma ou mais URLs, uma por linha",
        placeholder="https://example.com\nhttps://www.youtube.com/watch?v=...",
        height=100,
    )

    if st.button("Adicionar URL ao Notebook", type="secondary"):
        urls = [line.strip() for line in url_input.splitlines() if line.strip()]
        if not urls:
            st.warning("Informe pelo menos uma URL.")
        else:
            with st.spinner("Adicionando URLs ao NotebookLM..."):
                try:
                    for url in urls:
                        asyncio.run(
                            async_add_url_source(
                                auth,
                                st.session_state.notebook_id,
                                url,
                            )
                        )
                    st.success(f"{len(urls)} URL(s) adicionada(s) com sucesso.")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao adicionar URL: {e}")

    if has_sources:
        st.success(f"Este notebook ja tem {len(current_sources)} fonte(s) disponivel(is).")
    else:
        st.info("Adicione um arquivo ou URL para habilitar a geracao.")

    selected_source_ids = []
    if current_sources:
        source_labels = {
            src.id: (src.title or src.url or src.id)
            for src in current_sources
        }
        selected_source_ids = st.multiselect(
            "Fontes para usar no infografico:",
            options=list(source_labels.keys()),
            default=list(source_labels.keys()),
            format_func=lambda source_id: source_labels[source_id],
            help="Se nada for alterado, o app usa todas as fontes disponiveis.",
        )

    st.header("Configuracao do Infografico")
    language_label = st.selectbox(
        "Idioma de geracao:",
        options=list(LANGUAGE_OPTIONS.keys()),
        index=0,
        help="Idioma em que o infografico sera gerado",
    )
    language = LANGUAGE_OPTIONS[language_label]
    compatibility_mode = st.checkbox(
        "Modo compativel para artefatos visuais",
        value=True,
        help=(
            "Configura o idioma global do NotebookLM e omite o campo 'language' "
            "do payload de infografico e apresentacao. Isso tende a ser mais "
            "estavel para evitar jobs eternos."
        ),
    )
    visual_artifact_language = None if compatibility_mode else language

    instructions = st.text_area(
        "Instrucoes para geracao (opcional):",
        placeholder="Ex: Use cores vibrantes, destaque os pontos principais, inclua icones...",
        height=100,
        help="Instrucoes especiais para personalizar o infografico",
    )

    slide_instructions = st.text_area(
        "Instrucoes para apresentacao de slides (opcional):",
        placeholder="Ex: Estruture em introducao, pontos principais e conclusao com linguagem executiva...",
        height=100,
        help="Instrucoes especiais para a apresentacao de slides",
    )

    debug_mode = st.checkbox(
        "Mostrar payload de depuracao",
        value=False,
        help="Exibe o payload exato enviado ao RPC CREATE_ARTIFACT para comparar com o navegador.",
    )

    st.divider()

    col1, col2 = st.columns([1, 1])

    with col1:
        generate_disabled = (not has_sources) or (not selected_source_ids)

        orientation_enum = orientation_to_enum(orientation)
        detail_enum = detail_to_enum(detail)
        style_enum = style_to_enum(style)

        if debug_mode:
            with st.expander("Payload de depuracao: Infografico"):
                st.json(
                    build_debug_request_preview(
                        RPCMethod.CREATE_ARTIFACT,
                        build_infographic_params(
                            selected_source_ids,
                            visual_artifact_language,
                            instructions if instructions else None,
                            orientation_enum,
                            detail_enum,
                            style_enum,
                        ),
                    )
                )

        if st.button(
            "Iniciar Geracao do Infografico",
            type="primary",
            disabled=generate_disabled,
        ):
            with st.spinner("Iniciando geracao do infografico..."):
                try:
                    if language not in SUPPORTED_LANGUAGES:
                        raise ValueError(f"Idioma nao suportado pelo NotebookLM: {language}")
                    asyncio.run(async_set_output_language(auth, language))

                    status = asyncio.run(
                        async_start_infographic_generation(
                            auth,
                            st.session_state.notebook_id,
                            selected_source_ids,
                            orientation_enum,
                            detail_enum,
                            visual_artifact_language,
                            instructions if instructions else None,
                            style_enum,
                        )
                    )
                    st.session_state.infographic_task_id = status.task_id
                    st.session_state.infographic_status = status.status
                    st.session_state.infographic_ready = False
                    st.session_state.infographic_path = None
                    st.success(f"Geracao iniciada. Task ID: {status.task_id}")
                except Exception as e:
                    st.error(f"Erro ao gerar infografico: {e}")

        task_id = st.session_state.infographic_task_id
        if task_id:
            status_text = st.session_state.infographic_status or "desconhecido"
            st.caption(f"Task atual: {task_id}")
            st.info(f"Status da geracao: {status_text}")

            if st.button("Atualizar Status da Geracao", type="secondary"):
                with st.spinner("Consultando status da geracao..."):
                    try:
                        status = asyncio.run(
                            async_poll_infographic_status(
                                auth,
                                st.session_state.notebook_id,
                                task_id,
                            )
                        )
                        st.session_state.infographic_status = status.status

                        if status.is_complete:
                            output_dir = tempfile.mkdtemp()
                            output_path = Path(output_dir) / f"infographic_{task_id}.png"
                            asyncio.run(
                                async_download_infographic(
                                    auth,
                                    st.session_state.notebook_id,
                                    str(output_path),
                                    artifact_id=task_id,
                                )
                            )
                            st.session_state.infographic_path = output_path
                            st.session_state.infographic_ready = True
                            st.success("Infografico concluido e baixado.")
                        elif status.is_failed:
                            st.session_state.infographic_ready = False
                            st.error(status.error or "A geracao falhou.")
                        else:
                            st.warning(
                                "A geracao ainda nao concluiu. "
                                "Isso pode ocorrer mesmo que outra geracao feita na interface web termine antes, "
                                "porque cada solicitacao cria uma tarefa separada no backend."
                            )
                    except Exception as e:
                        st.error(f"Erro ao consultar status: {e}")

    with col2:
        infographic_path = st.session_state.infographic_path

        if st.button("Buscar Ultimo Infografico Pronto", type="secondary"):
            with st.spinner("Buscando ultimo infografico pronto no notebook..."):
                try:
                    output_dir = tempfile.mkdtemp()
                    output_path = Path(output_dir) / "infografico_ultimo.png"
                    asyncio.run(
                        async_download_infographic(
                            auth,
                            st.session_state.notebook_id,
                            str(output_path),
                        )
                    )
                    st.session_state.infographic_path = output_path
                    st.session_state.infographic_ready = True
                    st.session_state.infographic_status = "completed"
                    st.success("Ultimo infografico pronto carregado.")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao buscar infografico: {e}")

        if (
            st.session_state.infographic_ready
            and infographic_path
            and Path(infographic_path).exists()
        ):
            st.success("Infografico pronto.")

            try:
                st.image(str(infographic_path), width=500)
            except Exception:
                st.warning("Nao foi possivel visualizar a imagem.")

            with open(infographic_path, "rb") as file_handle:
                st.download_button(
                    "Baixar Infografico",
                    file_handle,
                    file_name="infografico.png",
                    mime="image/png",
                    type="primary",
                )

            if st.button("Gerar Novo"):
                st.session_state.infographic_ready = False
                st.session_state.infographic_path = None
                st.rerun()
        elif st.session_state.infographic_ready and infographic_path:
            st.warning("O infografico foi gerado, mas o arquivo local nao foi encontrado para download.")
        else:
            st.info("Adicione uma fonte e clique em gerar.")

    st.divider()
    st.header("Apresentacao de Slides")

    slide_col1, slide_col2 = st.columns([1, 1])

    with slide_col1:
        slide_generate_disabled = (not has_sources) or (not selected_source_ids)

        slide_format_enum = slide_format_to_enum(slide_format)
        slide_length_enum = slide_length_to_enum(slide_length)

        if debug_mode:
            with st.expander("Payload de depuracao: Apresentacao"):
                st.json(
                    build_debug_request_preview(
                        RPCMethod.CREATE_ARTIFACT,
                        build_slide_deck_params(
                            selected_source_ids,
                            visual_artifact_language,
                            slide_instructions if slide_instructions else None,
                            slide_format_enum,
                            slide_length_enum,
                        ),
                    )
                )

        if st.button(
            "Iniciar Geracao da Apresentacao",
            type="primary",
            disabled=slide_generate_disabled,
        ):
            with st.spinner("Iniciando geracao da apresentacao..."):
                try:
                    if language not in SUPPORTED_LANGUAGES:
                        raise ValueError(f"Idioma nao suportado pelo NotebookLM: {language}")
                    asyncio.run(async_set_output_language(auth, language))

                    status = asyncio.run(
                        async_start_slide_deck_generation(
                            auth,
                            st.session_state.notebook_id,
                            selected_source_ids,
                            visual_artifact_language,
                            slide_instructions if slide_instructions else None,
                            slide_format_enum,
                            slide_length_enum,
                        )
                    )
                    st.session_state.slide_task_id = status.task_id
                    st.session_state.slide_status = status.status
                    st.session_state.slide_ready = False
                    st.session_state.slide_path = None
                    st.success(f"Geracao da apresentacao iniciada. Task ID: {status.task_id}")
                except Exception as e:
                    st.error(f"Erro ao gerar apresentacao: {e}")

        slide_task_id = st.session_state.slide_task_id
        if slide_task_id:
            slide_status_text = st.session_state.slide_status or "desconhecido"
            st.caption(f"Task atual da apresentacao: {slide_task_id}")
            st.info(f"Status da apresentacao: {slide_status_text}")

            if st.button("Atualizar Status da Apresentacao", type="secondary"):
                with st.spinner("Consultando status da apresentacao..."):
                    try:
                        status = asyncio.run(
                            async_poll_slide_deck_status(
                                auth,
                                st.session_state.notebook_id,
                                slide_task_id,
                            )
                        )
                        st.session_state.slide_status = status.status

                        if status.is_complete:
                            output_dir = tempfile.mkdtemp()
                            extension = "pdf" if slide_download_format == "pdf" else "pptx"
                            output_path = Path(output_dir) / f"slide_deck_{slide_task_id}.{extension}"
                            asyncio.run(
                                async_download_slide_deck(
                                    auth,
                                    st.session_state.notebook_id,
                                    str(output_path),
                                    artifact_id=slide_task_id,
                                    output_format=slide_download_format,
                                )
                            )
                            st.session_state.slide_path = output_path
                            st.session_state.slide_ready = True
                            st.success("Apresentacao concluida e baixada.")
                        elif status.is_failed:
                            st.session_state.slide_ready = False
                            st.error(status.error or "A geracao da apresentacao falhou.")
                        else:
                            st.warning("A apresentacao ainda nao concluiu.")
                    except Exception as e:
                        st.error(f"Erro ao consultar apresentacao: {e}")

    with slide_col2:
        slide_path = st.session_state.slide_path

        if st.button("Buscar Ultima Apresentacao Pronta", type="secondary"):
            with st.spinner("Buscando ultima apresentacao pronta no notebook..."):
                try:
                    output_dir = tempfile.mkdtemp()
                    extension = "pdf" if slide_download_format == "pdf" else "pptx"
                    output_path = Path(output_dir) / f"slide_deck_latest.{extension}"
                    asyncio.run(
                        async_download_slide_deck(
                            auth,
                            st.session_state.notebook_id,
                            str(output_path),
                            output_format=slide_download_format,
                        )
                    )
                    st.session_state.slide_path = output_path
                    st.session_state.slide_ready = True
                    st.session_state.slide_status = "completed"
                    st.success("Ultima apresentacao pronta carregada.")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao buscar apresentacao: {e}")

        if st.session_state.slide_ready and slide_path and Path(slide_path).exists():
            st.success("Apresentacao pronta.")
            st.write(f"Arquivo preparado: `{Path(slide_path).name}`")

            mime_type = (
                "application/pdf"
                if slide_download_format == "pdf"
                else "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            )
            with open(slide_path, "rb") as file_handle:
                st.download_button(
                    "Baixar Apresentacao",
                    file_handle,
                    file_name=Path(slide_path).name,
                    mime=mime_type,
                    type="primary",
                )

            if st.button("Nova Apresentacao"):
                st.session_state.slide_ready = False
                st.session_state.slide_path = None
                st.rerun()
        elif st.session_state.slide_ready and slide_path:
            st.warning("A apresentacao foi gerada, mas o arquivo local nao foi encontrado para download.")
        else:
            st.info("Adicione uma fonte e clique em gerar a apresentacao.")


if __name__ == "__main__":
    main()
